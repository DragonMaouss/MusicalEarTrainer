/**
 * Downloads a YouTube audio clip using yt-dlp and runs key detection on it.
 * Uses yt-dlp (system binary) instead of ytdl-core to bypass YouTube's
 * server-side bot detection (403 errors on datacenter IPs).
 */
import { spawn } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { computeChromagram, findKey, type KeyResult } from "./keyDetector";

export interface VideoInfo {
  videoId: string;
  title: string;
  thumbnail: string;
}

export interface AnalysisResult extends KeyResult {
  videoId: string;
  title: string;
  thumbnail: string;
}

export interface RandomYoutubeSong {
  videoId: string;
  title: string;
  thumbnail: string;
  url: string;
}

// tv_embedded and the Android creator/test/music clients currently expose
// downloadable formats for fresh videos from datacenter IPs. Keep the
// clients that require a different access path out of the primary list.
const PLAYER_CLIENTS = "tv_embedded,android_creator,android_test,android_music";
const YT_DLP_COMMAND = (() => {
  const projectBinary = join(process.cwd(), ".pythonlibs", "bin", "yt-dlp");
  return existsSync(projectBinary) ? projectBinary : "yt-dlp";
})();

function spawnYtDlp(args: string[]) {
  return spawn(YT_DLP_COMMAND, ["--force-ipv4", ...args], {
    env: {
      ...process.env,
      // The Replit Nix environment exposes an older yt-dlp in PYTHONPATH.
      // Clearing it lets the project-local current version load its own package.
      PYTHONPATH: undefined,
      REPLIT_PYTHONPATH: undefined,
    },
  });
}

const RANDOM_SEARCHES = [
  "official music video pop song",
  "official music video rock song",
  "official music video indie song",
  "official music video soul song",
  "official music video hip hop song",
  "official music video electronic song",
  "official music video French song",
  "official music video 2000s hit",
  "official music video 2010s hit",
  "official audio alternative song",
];

/** Extract YouTube video ID from various URL forms */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
    /shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

/** Search YouTube for a varied pool of music videos and choose one at random. */
export async function findRandomYoutubeSong(): Promise<RandomYoutubeSong> {
  const search = RANDOM_SEARCHES[Math.floor(Math.random() * RANDOM_SEARCHES.length)];

  return new Promise((resolve, reject) => {
    const proc = spawnYtDlp([
      "--flat-playlist",
      "--dump-json",
      "--playlist-end", "10",
      "--no-playlist",
      "--no-warnings",
      "--extractor-args", `youtube:player_client=${PLAYER_CLIENTS}`,
      `ytsearch10:${search}`,
    ]);

    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (d: Buffer) => (stdout += d.toString()));
    proc.stderr.on("data", (d: Buffer) => (stderr += d.toString()));

    proc.on("close", (code) => {
      const results = stdout
        .split(/\r?\n/)
        .filter(Boolean)
        .flatMap((line) => {
          try {
            const item = JSON.parse(line);
            const duration = Number(item.duration ?? 0);
            if (!item.id || !item.title || (duration > 0 && (duration < 60 || duration > 600))) {
              return [];
            }
            return [{
              videoId: String(item.id),
              title: String(item.title),
              thumbnail: String(
                item.thumbnails?.sort((a: { width?: number }, b: { width?: number }) =>
                  (b.width ?? 0) - (a.width ?? 0)
                )[0]?.url ?? `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`
              ),
              url: `https://www.youtube.com/watch?v=${item.id}`,
            }];
          } catch {
            return [];
          }
        });

      if (results.length === 0) {
        reject(new Error(`No random music result found (code ${code}): ${stderr.slice(0, 300)}`));
        return;
      }

      resolve(results[Math.floor(Math.random() * results.length)]);
    });
    proc.on("error", reject);
  });
}

/** Fetch basic video metadata via yt-dlp --dump-json (no download) */
export async function getVideoInfo(url: string): Promise<VideoInfo> {
  return new Promise((resolve, reject) => {
    const proc = spawnYtDlp([
      "--dump-json",
      "--no-playlist",
      "--no-warnings",
      "--extractor-args", `youtube:player_client=${PLAYER_CLIENTS}`,
      url,
    ]);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d: Buffer) => (stdout += d.toString()));
    proc.stderr.on("data", (d: Buffer) => (stderr += d.toString()));

    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`yt-dlp metadata failed (code ${code}): ${stderr.slice(0, 300)}`));
        return;
      }
      try {
        const info = JSON.parse(stdout);
        const videoId: string = info.id ?? "";
        const title: string = info.title ?? "Unknown";
        const thumbnails: Array<{ url: string; width?: number }> = info.thumbnails ?? [];
        const thumbnail =
          thumbnails
            .filter((t) => t.url)
            .sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]?.url ??
          `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        resolve({ videoId, title, thumbnail });
      } catch {
        reject(new Error("Failed to parse yt-dlp JSON output"));
      }
    });

    proc.on("error", reject);
  });
}

/**
 * Download ~30 s of audio via yt-dlp piped to ffmpeg → raw 16-bit mono PCM at 22050 Hz.
 *
 * EPIPE safety: when ffmpeg finishes (or is killed after 30 s), yt-dlp's stdout
 * will emit EPIPE. We swallow those errors explicitly so Node.js doesn't crash.
 */
function downloadPCM(url: string): Promise<Int16Array> {
  return new Promise((resolve, reject) => {
    const MAX_SECONDS = 30;
    const SAMPLE_RATE = 22050;
    const MAX_BYTES = MAX_SECONDS * SAMPLE_RATE * 2; // 16-bit = 2 bytes/sample

    let settled = false;
    const done = (err: Error | null, pcm?: Int16Array) => {
      if (settled) return;
      settled = true;
      if (err) reject(err);
      else resolve(pcm!);
    };

    // yt-dlp streams best audio to stdout
    const ytdlp = spawnYtDlp([
      "--no-playlist",
      "--no-warnings",
      "--extractor-args", `youtube:player_client=${PLAYER_CLIENTS}`,
      "-f", "bestaudio/best",
      "-o", "-",
      "--quiet",
      url,
    ]);

    // ffmpeg decodes to raw PCM
    const ffmpeg = spawn("ffmpeg", [
      "-i", "pipe:0",
      "-f", "s16le",
      "-acodec", "pcm_s16le",
      "-ar", String(SAMPLE_RATE),
      "-ac", "1",
      "-t", String(MAX_SECONDS),
      "pipe:1",
    ]);

    // Suppress EPIPE on ytdlp stdout — happens when ffmpeg stdin closes first
    ytdlp.stdout.on("error", () => {});
    // Suppress broken-pipe errors on ffmpeg stdin
    ffmpeg.stdin.on("error", () => {});

    // Pipe yt-dlp → ffmpeg
    ytdlp.stdout.pipe(ffmpeg.stdin);

    let ytdlpStderr = "";
    ytdlp.stderr.on("data", (d: Buffer) => { ytdlpStderr += d.toString(); });
    ffmpeg.stderr.on("data", () => {/* suppress ffmpeg progress */});

    ytdlp.on("error", (err) => {
      ffmpeg.kill("SIGTERM");
      done(err);
    });

    ytdlp.on("close", (code) => {
      // Non-zero exit from yt-dlp when ffmpeg killed it early is expected — ignore
      if (code !== 0 && code !== null && chunks.length === 0) {
        // Only fail if we got nothing at all
        const hint = ytdlpStderr.slice(0, 400);
        done(new Error(`yt-dlp exited with code ${code}: ${hint}`));
      }
      // Otherwise let ffmpeg close event handle resolution
    });

    const chunks: Buffer[] = [];
    let totalBytes = 0;

    ffmpeg.stdout.on("data", (chunk: Buffer) => {
      totalBytes += chunk.length;
      chunks.push(chunk);
      if (totalBytes >= MAX_BYTES) {
        // We have 30 s — kill both processes
        ytdlp.stdout.unpipe(ffmpeg.stdin);
        ytdlp.kill("SIGTERM");
        ffmpeg.kill("SIGTERM");
      }
    });

    ffmpeg.on("error", (err) => done(err));

    ffmpeg.on("close", () => {
      if (chunks.length === 0) {
        const hint = ytdlpStderr.slice(0, 400);
        done(new Error(`No audio data received. yt-dlp output: ${hint}`));
        return;
      }
      const buf = Buffer.concat(chunks);
      const pcm = new Int16Array(buf.buffer, buf.byteOffset, Math.floor(buf.length / 2));
      done(null, pcm);
    });
  });
}

/** Main entry: download audio + run chromagram + key detection */
export async function analyzeYoutubeKey(url: string): Promise<AnalysisResult> {
  // Run metadata fetch and audio download in parallel
  const [info, pcm] = await Promise.all([
    getVideoInfo(url),
    downloadPCM(url),
  ]);

  const SAMPLE_RATE = 22050;
  const chroma = computeChromagram(pcm, SAMPLE_RATE);
  const keyResult = findKey(chroma);

  return {
    ...keyResult,
    videoId: info.videoId,
    title: info.title,
    thumbnail: info.thumbnail,
  };
}

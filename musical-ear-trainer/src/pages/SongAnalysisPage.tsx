import { useState, useRef, useEffect} from "react";
import * as Tone from "tone";

const CHROMATIC_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const  WHITE_NOTES = [
    "C4", "D4", "E4", "F4", "G4", "A4", "B4", 
    "C5", "D5", "E5", "F5", "G5", "A5", "B5"
]

const BLACK_KEYS = [
  { note: 'C#4', afterWhiteKey: 0 },
  { note: 'D#4', afterWhiteKey: 1 },
  { note: 'F#4', afterWhiteKey: 3 },
  { note: 'G#4', afterWhiteKey: 4 },
  { note: 'A#4', afterWhiteKey: 5 },
  { note: 'C#5', afterWhiteKey: 7 },
  { note: 'D#5', afterWhiteKey: 8 },
  { note: 'F#5', afterWhiteKey: 10 },
  { note: 'G#5', afterWhiteKey: 11 },
  { note: 'A#5', afterWhiteKey: 12 },
]

type Mode = "Majeur" | "Mineur";

type AnalysisResult = {
  videoId: string
  title: string
  thumbnail: string
  key: string
  scale: 'major' | 'minor'
  confidence: number
  fullName: string
}

function getYoutubeVideoID(input: string): string | null {
    try {
        const url = new URL(input);
        const hostname = url.hostname.toLowerCase();
        let videoID: string | null = null;

        if (hostname === "www.youtube.com" || hostname === "youtube.com") {
            videoID = url.searchParams.get("v");
        } else if (hostname === "youtu.be") {
            videoID = url.pathname.slice(1);
        }

        return videoID;
    } catch (error) {
        console.error("Invalid URL:", error);
        return null;
    }
}

export default function SongAnalysisPage() {
    const [youtubeURL, setYoutubeURL] = useState("");
    const [videoID, setVideoID] = useState<string | null>(null);
    const [selectedNote, setSelectedNote] = useState<string | null>(null);
    const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisError, setAnalysisError] = useState('')
        
    const synthRef = useRef<Tone.Synth | null>(null);

    useEffect(() => {
        synthRef.current = new Tone.Synth().toDestination();
        return () => {
            synthRef.current?.dispose();
        };
    }, []);

    async function playNote(note: string) {
        await Tone.start();
        synthRef.current?.triggerAttackRelease(note, "8n");
    }

    async function analyzeVideo(url: string) {
        setIsAnalyzing(true)
        setAnalysis(null)
        setAnalysisError('')

        try {
            const response = await fetch('/api/analysis/youtube-key', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
            })

            const data = await response.json()

            if (!response.ok) {
            throw new Error(data.message ?? 'L’analyse a échoué.')
            }

            setAnalysis(data)
        } catch (error) {
            setAnalysisError(
            error instanceof Error
                ? error.message
                : 'Impossible d’analyser la vidéo.',
            )
        } finally {
            setIsAnalyzing(false)
        }
    }

    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault()

        const id = getYoutubeVideoID(youtubeURL)

        if (!id) {
            setVideoID(null)
            return
        }

        setVideoID(id)
        setAnalysis(null)
        void analyzeVideo(youtubeURL)
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <header className="bg-blue-600 text-white p-4">
                <div className="container mx-auto">
                    <h1 className="text-2xl font-bold mt-2">Analyse de Chanson</h1>
                    <p className="mt-1">Ecoute la chanson, essaie des notes au piano et propose une tonalité.</p>
                </div>
            </header>
            
            <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
                <section className="rounded-lg border bg-white p-5">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                        <label htmlFor="youtubeURL" className="sr-only">URL YouTube:</label>
                        <input
                            type="url"
                            id="youtubeURL"
                            value={youtubeURL}
                            required
                            onChange={(e) => setYoutubeURL(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="min-w-0 flex-1 rounded-md border px-4 py-2"
                        />
                        <button
                            type="submit"
                            className="rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                        >
                            Afficher la vidéo
                        </button>
                    </form>

                    {videoID && (
                        <section className="rounded-lg border bg-white p-5">
                            <h2 className="text-lg font-semibold mb-4">Vidéo YouTube</h2>

                            <iframe
                                className="w-full aspect-video rounded"
                                title="Lecteur Youtube"
                                src={`https://www.youtube.com/embed/${videoID}`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>

                            <section className="mt-6 rounded-md border bg-gray-50 p-4">
                                <h2 className="text-lg font-semibold">
                                    Analyse de la tonalité
                                </h2>

                                {isAnalyzing && (
                                    <p className="mt-2 text-gray-600">
                                    Analyse de la chanson en cours…
                                    </p>
                                )}

                                {analysisError && (
                                    <p role="alert" className="mt-2 text-red-700">
                                    {analysisError}
                                    </p>
                                )}

                                {analysis && (
                                    <div className="mt-3">
                                    <p className="text-xl font-semibold">
                                        {analysis.key} {analysis.scale === 'major' ? 'majeur' : 'mineur'}
                                    </p>

                                    <p className="mt-1 text-sm text-gray-600">
                                        Confiance estimée : {Math.round(analysis.confidence * 100)} %
                                    </p>

                                    <p className="mt-2 text-sm text-gray-600">
                                        Cette tonalité est une estimation calculée sur un extrait audio.
                                    </p>
                                    </div>
                                )}
                            </section>
                        </section>
                    )}

                    <section className="rounded-lg border bg-white p-5">
                        <h2 className="text-lg font-semibold mb-4">
                            Piano Virtuel
                        </h2>

                        <p className="mb-4">
                            Cliquez sur les touches pour jouer des notes.
                        </p>

                        <div className="mt-5 overflow-x-auto pb-2">
                            <div className="relative h-48 w-[840px] select-none">
                                <div className="flex h-full">
                                    {WHITE_NOTES.map((note) => (
                                    <button
                                        key={note}
                                        type="button"
                                        aria-label={`Jouer la note ${note}`}
                                        onClick={() => playNote(note)}
                                        className="h-full w-[60px] shrink-0 rounded-b-md border border-gray-400 bg-white pb-3 text-sm text-gray-700 hover:bg-blue-50 active:bg-blue-100"
                                    >
                                    <span className="flex h-full items-end justify-center">
                                            {note}
                                    </span>
                                    </button>
                                ))}
                                </div>

                                {BLACK_KEYS.map(({ note, afterWhiteKey }) => (
                                    <button
                                        key={note}
                                        type="button"
                                        aria-label={`Jouer la note ${note}`}
                                        onClick={() => playNote(note)}
                                        style={{ left: (afterWhiteKey + 1) * 60 - 20 }}
                                        className="absolute top-0 z-10 flex h-28 w-10 items-end justify-center rounded-b-md border border-gray-950 bg-gray-900 pb-2 text-xs text-white shadow-md hover:bg-gray-700 active:bg-blue-700"
                                    >
                                        {note}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="rounded-lg border bg-white p-5">
                        <div>
                            <h2 className="font-semibold">Note fondamentale</h2>

                            <div className="mt-2 flex flex-wrap gap-2">
                                {CHROMATIC_NOTES.map((note) => (
                                    <button
                                        key={note}
                                        type="button"
                                        onClick={() => setSelectedNote(note)}
                                        className={`rounded-md border px-4 py-2 text-sm font-medium ${
                                            selectedNote === note ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        {note}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="font-semibold">Mode</h2>

                            <div className="mt-3 grid grid-cols-2 gap-2">
                                {(["Majeur", "Mineur"] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        type="button"
                                        aria-pressed={selectedMode === mode}
                                        onClick={() => {
                                            setSelectedMode(mode)
                                        }}
                                        className={`rounded-md border px-3 py-2 ${
                                            selectedMode === mode 
                                                ? "border-blue-700 bg-blue-600 text-white"
                                                : "bg-white hover:bg-gray-100"
                                        }`}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <button 
                                type="button"
                                /** TODO : check if it is correct */
                                className="w-full rounded-md bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
                            >
                                Soumettre ma réponse
                            </button>
                        </div>
                    </section>

                </section>
            </main>
        </div>
    );
}       
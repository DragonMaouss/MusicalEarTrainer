import { useState, useRef, useEffect} from "react";
import * as Tone from "tone";


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

    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const id = getYoutubeVideoID(youtubeURL);
        setVideoID(id);
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
                        </section>
                    )}

                </section>
            </main>
        </div>
    );
}       
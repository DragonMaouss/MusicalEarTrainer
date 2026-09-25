import { useState } from "react";
import * as Tone from "tone";

type ChordType = 'Majeur' | 'Mineur';

type ChordQuestion = {
    type: ChordType;
    notes: string[];
};

const rootNotes = [
    "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
];
const QUESTION_PER_SESSION = 5;

function generateChordQuestion(): ChordQuestion {
    const isMajor = Math.random() < 0.5;
    const rootNote = rootNotes[Math.floor(Math.random() * rootNotes.length)];
    

    const notes = isMajor
        ? [rootNote, Tone.Frequency(rootNote).transpose(4).toNote(), Tone.Frequency(rootNote).transpose(7).toNote()]
        : [rootNote, Tone.Frequency(rootNote).transpose(3).toNote(), Tone.Frequency(rootNote).transpose(7).toNote()];

    return {
        type: isMajor ? 'Majeur' : 'Mineur',
        notes,
    };
}

export default function ChordExercisePage() {
    const [questions, setQuestions] = useState<ChordQuestion[]>(() =>
        Array.from({ length: QUESTION_PER_SESSION }, () => generateChordQuestion())
    );
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selected, setSelected] = useState<ChordType | null>(null);
    const [validated, setValidated] = useState(false);
    const [score, setScore] = useState(0);
    const [sessionFinished, setSessionFinished] = useState(false);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = validated && selected === currentQuestion.type;

    async function playChord() {
        await Tone.start();

        const synth = new Tone.PolySynth().toDestination();
        const now = Tone.now();
        synth.triggerAttackRelease(currentQuestion.notes, "8n", now);
    }

        function handleValidate() {
        if (selected === null) return
        const isAnswerCorrect = selected === currentQuestion.type
        if (isAnswerCorrect) {
            setScore((prevScore) => prevScore + 1)
        }
        setValidated(true)

    }

    function handleNextQuestion() {
        if (currentQuestionIndex + 1 >= questions.length) {
            setSessionFinished(true)
            return
        }
        setCurrentQuestionIndex((prevIndex) => (prevIndex + 1))
        setSelected(null)
        setValidated(false)
    }

    function handleRestart() {
        setQuestions(Array.from({ length: QUESTION_PER_SESSION }, () => generateChordQuestion()))
        setCurrentQuestionIndex(0)
        setSelected(null)
        setValidated(false)
        setScore(0)
        setSessionFinished(false)
    }

    if (sessionFinished) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
                <header className="border-b border-gray-300 w-full py-4 mb-8">
                    <div className="container mx-auto text-center">
                        <h1 className="text-3xl font-bold">Exercice d'intervalles</h1>
                    </div>
                </header>

                <main className="container mx-auto px-4">
                    <section className="bg-white p-8 rounded shadow-md text-center">
                        <h2 className="text-2xl font-semibold mb-4">Session terminée !</h2>
                        <p className="text-gray-600 mb-4">Votre score : {score} / {QUESTION_PER_SESSION}</p>
                        <button
                            type="button"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={handleRestart}
                        >
                            Recommencer
                        </button>
                        <button>
                            <a href="/" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-4">
                                Retour à l'accueil
                            </a>
                        </button>
                    </section>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <header className="border-b border-gray-300 w-full py-4 mb-8">
                <div className="container mx-auto text-center">
                    <h1 className="text-3xl font-bold">Exercice d'accords - Question {currentQuestionIndex + 1} / {QUESTION_PER_SESSION}</h1>
                </div>
            </header>

            
            <main className="container mx-auto px-4">
                <section className="bg-white p-8 rounded shadow-md text-center">
                    <h2 className="text-2xl font-semibold mb-4">Ecoute l'accord et dis s'il est majeur ou mineur.</h2>
                    <div className="mb-4">
                    <button
                            type="button"
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            onClick={playChord}
                        >
                            Jouer l'accord
                        </button>
                    </div>

                    <p className="text-gray-600 mb-4">Sélectionnez la bonne réponse parmi les choix ci-dessous.</p>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {(['Majeur', 'Mineur'] as ChordType[]).map( type => {
                            const isSelected = selected === type

                            let baseClass =  "rounded-md border px-4 py-2 text-left hover:bg-gray-50"
                            
                            if (validated) {
                                if (type === currentQuestion.type) {
                                    baseClass = "rounded-md border border-green-600 bg-green-50 px-4 py-2 text-left"
                                } else if (isSelected) {
                                    baseClass = "rounded-md border border-red-600 bg-red-50 px-4 py-2 text-left"
                            } else if (isSelected) {
                                    baseClass = "rounded-md border border-blue-600 bg-blue-50 px-4 py-2 text-left"
                                }    
                            }
                            return (
                                <button
                                    type="button"
                                    key={type}
                                    className={baseClass}
                                    onClick={() => setSelected(type)}
                                    disabled={validated}
                                >
                                    {type}
                                </button>
                            )
                        })}
                    </div>

                    <div className="mt-4 flex items-center gap-4 ">
                        {!validated ? (
                            <button
                                type="button"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                onClick={handleValidate}
                                disabled={selected == null}
                            >
                                Valider
                            </button>
                        ) : (
                            <> 
                                <span className={`font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                    {isCorrect ? 'Correct !' : `Incorrect. La bonne réponse était : ${currentQuestion.type} `}
                                </span>
    
                            <button
                                type="button"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-4"
                                onClick={handleNextQuestion}
                            >
                                {currentQuestionIndex + 1 >= questions.length ? 'Voir le résultat' : 'Question suivante'}
                            </button>
                        </>
                        )}
                    </div>

                </section>
            </main>
        </div>
    )

}
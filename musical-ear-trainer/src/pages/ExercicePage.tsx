import { useState } from 'react'
import  * as Tone from 'tone'

type Interval = {
  name: string
  semitones: number
}

const INTERVALS: Interval[] = [
  { name: 'Unisson', semitones: 0 },
  { name: 'Seconde mineure', semitones: 1 },
  { name: 'Seconde majeure', semitones: 2 },
  { name: 'Tierce mineure', semitones: 3 },
  { name: 'Tierce majeure', semitones: 4 },
  { name: 'Quarte juste', semitones: 5 },
  { name: 'Quinte juste', semitones: 7 },
  { name: 'Sixte mineure', semitones: 8 },
  { name: 'Sixte majeure', semitones: 9 },
  { name: 'Octave', semitones: 12 },
]


function generateQuestion() {
  const correct = INTERVALS[Math.floor(Math.random() * INTERVALS.length)]
  // Generate 3 random incorrect answers 
  const others = INTERVALS.filter(interval => interval !== correct)
  const choices = [correct, ...others.sort(() => 0.5 - Math.random()).slice(0, 3)]
  return {
    correct, choices,
  }
}

const QUESTION_PER_SESSION = 5

type QuestionData = ReturnType<typeof generateQuestion>

export default function ExercicePage() {
    const [question, setQuestion] = useState<QuestionData[]>(() =>
        Array.from({ length: QUESTION_PER_SESSION }, () => generateQuestion()),
    )
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selected, setSelected] = useState<string | null>(null)
    const [validated, setValidated] = useState(false)
    const [score, setScore] = useState(0)
    const [sessionCompleted, setSessionCompleted] = useState(false)

    const currentQuestion = question[currentQuestionIndex]
    const isCorrect = validated && selected === currentQuestion.correct.name

    async function playInterval() {
        await Tone.start()

        const baseNote = "C4"
        const secondNote = Tone.Frequency(baseNote).transpose(currentQuestion.correct.semitones)

        const synth = new Tone.Synth().toDestination()

        // Play the base note and the second note with a short delay
        const now = Tone.now()
        synth.triggerAttackRelease(baseNote, "8n", now)
        synth.triggerAttackRelease(secondNote.toNote(), "8n", now + 0.5)

    }

    function handleValidate() {
        if (selected === null) return
        const isAnswerCorrect = selected === currentQuestion.correct.name
        if (isAnswerCorrect) {
            setScore((prevScore) => prevScore + 1)
        }
        setValidated(true)

    }

    function handleNextQuestion() {
        if (currentQuestionIndex + 1 >= question.length) {
            setSessionCompleted(true)
            return
        }
        setCurrentQuestionIndex((prevIndex) => (prevIndex + 1))
        setSelected(null)
        setValidated(false)
    }

    function handleRestart() {
        setQuestion(Array.from({ length: QUESTION_PER_SESSION }, () => generateQuestion()))
        setCurrentQuestionIndex(0)
        setSelected(null)
        setValidated(false)
        setScore(0)
        setSessionCompleted(false)
    }

    if (sessionCompleted) {
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
                    <h1 className="text-3xl font-bold">Exercice d'intervalles - Question {currentQuestionIndex + 1} / {QUESTION_PER_SESSION}</h1>
                </div>
            </header>

            
            <main className="container mx-auto px-4">
                <section className="bg-white p-8 rounded shadow-md text-center">
                    <h2 className="text-2xl font-semibold mb-4">Quel est cet intervalle ?</h2>
                    <div className="mb-4">
                    <button
                            type="button"
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            onClick={playInterval}
                        >
                            Jouer l'intervalle
                        </button>
                    </div>

                    <p className="text-gray-600 mb-4">Sélectionnez la bonne réponse parmi les choix ci-dessous.</p>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {currentQuestion.choices.map( choice => {
                            const isSelected = selected === choice.name

                            let baseClass =  "rounded-md border px-4 py-2 text-left hover:bg-gray-50"
                            
                            if (validated) {
                                if (choice.name === currentQuestion.correct.name) {
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
                                    key={choice.name}
                                    className={baseClass}
                                    onClick={() => setSelected(choice.name)}
                                    disabled={validated}
                                >
                                    {choice.name}
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
                                    {isCorrect ? 'Correct !' : `Incorrect. La bonne réponse était : ${currentQuestion.correct.name} `}
                                </span>
    
                            <button
                                type="button"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-4"
                                onClick={handleNextQuestion}
                            >
                                {currentQuestionIndex + 1 >= question.length ? 'Voir le résultat' : 'Question suivante'}
                            </button>
                        </>
                        )}
                    </div>

                    
                </section>
            </main>
        </div>
    )

}
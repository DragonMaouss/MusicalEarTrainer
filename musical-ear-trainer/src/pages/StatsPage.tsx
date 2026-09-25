import { useEffect, useState } from "react";
import { loadSessionResults } from "../storage";
import type { ExerciseType, SessionResult } from "../types";
import { Link } from "react-router-dom";

const EXERCISE_TYPES: { type : ExerciseType, label: string }[] = [
    { type: "intervals", label: "Intervalles" },
    { type: "chords", label: "Accords" }
];

function calculateStats( sessions: SessionResult[] ) {
    const questions = sessions.reduce((acc, session) => acc + session.totalQuestions, 0)
    const correct = sessions.reduce((acc, session) => acc + session.score, 0)

    return {
        sessions: sessions.length,
        questions: questions,
        correct: correct,
        averageScore: questions > 0 ? (correct / questions) * 100 : 0
    }
}

export default function StatsPage() {
    const [sessionResults, setSessionResults] = useState<SessionResult[]>([])

    useEffect(() => {
        setSessionResults(loadSessionResults())
    }, [])

    const totalSessions = sessionResults.length
    const totalQuestions = sessionResults.reduce((acc, session) => acc + session.totalQuestions, 0)
    const totalCorrectAnswers = sessionResults.reduce((acc, session) => acc + session.score, 0)
    const averageScore = totalSessions > 0 ? (totalCorrectAnswers / totalQuestions) * 100 : 0

    return (
        <div>
            <header className="border-b border-gray-300 w-full py-4 mb-8">
                <div className="container mx-auto text-center">
                    <h1 className="text-3xl font-bold">Statistiques</h1>
                </div>
            </header>
            <main className="container mx-auto px-4">
                <section className="bg-white p-8 rounded shadow-md text-center">
                    <h2 className="text-2xl font-semibold mb-4">Résumé des sessions</h2>
                    <p className="text-gray-600 mb-2">Nombre total de sessions : {totalSessions}</p>
                    <p className="text-gray-600 mb-2">Nombre total de questions : {totalQuestions}</p>
                    <p className="text-gray-600 mb-2">Nombre total de réponses correctes : {totalCorrectAnswers}</p>
                    <p className="text-gray-600 mb-4">Score moyen : {averageScore.toFixed(2)}%</p>
                </section>

                <section className="bg-white p-8 rounded shadow-md mt-8">
                    <h1 className="text-2xl font-semibold mb-4">Détails par type d'exercice</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {EXERCISE_TYPES.map((exercise) => {
                            const stats = calculateStats(sessionResults.filter((session) => session.exerciseType === exercise.type))
                            return (
                                <div key={exercise.type} className="bg-gray-100 p-4 rounded shadow-md">
                                    <h2 className="text-xl font-semibold mb-2">{exercise.label}</h2>
                                    <p className="text-gray-600 mb-1">Nombre de sessions : {stats.sessions}</p>
                                    <p className="text-gray-600 mb-1">Nombre de questions : {stats.questions}</p>
                                    <p className="text-gray-600 mb-1">Nombre de réponses correctes : {stats.correct}</p>
                                    <p className="text-gray-600 mb-1">Score moyen : {stats.averageScore.toFixed(2)}%</p>
                                </div>
                            )
                        })}
                    </div>
                </section>

            </main>
            <div className="container mx-auto px-4 mt-4">
            <button>
                <a href="/" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-4">
                    Retour à l'accueil
                </a>                
            </button>
            </div>
        </div>
    )
}

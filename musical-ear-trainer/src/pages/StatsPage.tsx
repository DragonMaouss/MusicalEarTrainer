import { useEffect, useState } from "react";
import { loadSessionResults } from "../storage";
import type { SessionResult } from "../types";


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

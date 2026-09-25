import { useNavigate } from "react-router-dom";

type ExerciseType = {
    id: string;
    name: string;
    description: string;
    path: string;
}

const EXERCISES: ExerciseType[] = [
    {
        id: "intervals",
        name: "Intervalles",
        description: "Reconnaître la distance entre deux notes (seconde, tierce, quinte, etc.).",
        path: "/exercices/intervalles"
    },
    {
        id: "chords",
        name: "Accords",
        description: "Identifier les accords majeurs et mineurs.",
        path: "/exercices/accords"
    }
]

export default function ExercicesPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-6">Exercices</h1>
                <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {EXERCISES.map((exercise) => (
                        <div key={exercise.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                            <h2 className="text-xl font-semibold mb-2">{exercise.name}</h2>
                            <p className="text-gray-600 mb-4">{exercise.description}</p>
                            <button
                                onClick={() => navigate(exercise.path)}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Commencer
                            </button>
                        </div>
                    ))}
                </section>
                <button
                    onClick={() => navigate('/')}
                    className="mt-8 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                    Retour à l'accueil
                </button>
            </main>
        </div>
    )
}
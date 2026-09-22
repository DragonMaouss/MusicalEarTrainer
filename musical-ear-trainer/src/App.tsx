import { useNavigate } from 'react-router-dom'

function App() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <header className="border-b border-gray-300 w-full py-4 mb-8">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl font-bold">Musical Ear Trainer</h1>
          <p className="text-lg text-gray-600">Application web d'entraînement de l'oreille musicale</p>
        </div>
      </header>

      <main className="container mx-auto px-4">
        <section className="bg-white p-8 rounded shadow-md text-center">
          <h2 className="text-2xl font-semibold mb-4">Bienvenue</h2>
          <p className="text-gray-600">Développé ton oreille musicale avec des exercices interactifs.</p>
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => navigate('/exercice')}
          >
            Commencer un exercice
          </button>
          <button 
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-4"
            onClick={() => navigate('/stats')}
          >
            Voir les statistiques
          </button>
        </section>
      </main>
    </div>
  )
}

export default App

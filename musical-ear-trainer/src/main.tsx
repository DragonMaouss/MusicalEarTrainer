import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StrictMode } from 'react'
import './index.css'
import App from './App.tsx'
import IntervalExercisePage from './pages/IntervalExercisePage.tsx'
import StatsPage from './pages/StatsPage.tsx';
import ExercisesPage from './pages/ExercisesPage.tsx';
import ChordExercisePage from './pages/ChordExercisePage.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/exercices" element={<ExercisesPage />} />
        <Route path="/exercices/intervalles" element={<IntervalExercisePage />} />
        <Route path="/exercices/accords" element={<ChordExercisePage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

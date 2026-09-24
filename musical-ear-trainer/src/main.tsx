import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StrictMode } from 'react'
import './index.css'
import App from './App.tsx'
import ExercicePage from './pages/IntervalExercisePage.tsx'
import StatsPage from './pages/StatsPage.tsx';
import ExercicesPage from './pages/ExercisesPage.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/exercices" element={<ExercicesPage />} />
        <Route path="/exercices/intervalles" element={<ExercicePage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

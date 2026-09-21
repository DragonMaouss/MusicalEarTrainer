import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StrictMode } from 'react'
import './index.css'
import App from './App.tsx'
import ExercicePage from './pages/ExercicePage.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/exercice" element={<ExercicePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

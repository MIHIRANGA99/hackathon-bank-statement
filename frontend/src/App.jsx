import Chatbot from './components/Chatbot/Chatbot';

import { Routes, Route, Navigate } from 'react-router-dom'
import { WelcomePage } from '@/pages/WelcomePage'
import { DashboardPage } from '@/pages/DashboardPage'
import { AnalyserPage } from '@/pages/AnalyserPage'
import { AppBackground } from '@/components/AppBackground'

function App() {
  return (
    <>
      <AppBackground />

      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analyser" element={<AnalyserPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Financial Chatbot */}
      <Chatbot />
    </>
  )
}

export default App

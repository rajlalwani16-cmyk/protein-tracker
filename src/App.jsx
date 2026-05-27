import { Routes, Route, useLocation } from 'react-router-dom'
import { useApp } from './context/AppContext.jsx'
import BottomNav from './components/BottomNav.jsx'
import Onboarding from './components/Onboarding.jsx'
import { StreakCelebration } from './components/StreakBadge.jsx'
import Dashboard from './pages/Dashboard.jsx'
import LogFood from './pages/LogFood.jsx'
import Recipes from './pages/Recipes.jsx'
import History from './pages/History.jsx'
import Settings from './pages/Settings.jsx'

function Toast() {
  const { toast } = useApp()
  return (
    <div className={`toast${toast ? ' show' : ''}`} role="status" aria-live="polite">
      {toast}
    </div>
  )
}

export default function App() {
  const { state } = useApp()

  if (!state.onboardingComplete) return <Onboarding />

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/log" element={<LogFood />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <BottomNav />
      <Toast />
      <StreakCelebration />
    </>
  )
}

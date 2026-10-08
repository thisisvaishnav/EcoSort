import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { EcoSortGame } from './components/game/EcoSortGame';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'game' | 'report'>('landing');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Navbar currentView={currentView} onNavigate={setCurrentView} />

      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartGame={() => setCurrentView('game')}
            onOpenReport={() => setCurrentView('report')}
          />
        )}

        {currentView === 'game' && (
          <EcoSortGame onOpenTeacherReport={() => setCurrentView('report')} />
        )}

        {currentView === 'report' && <TeacherDashboard />}
      </main>
    </div>
  );
}

export default App;

import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { WorldPage } from './components/world/WorldPage';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'game' | 'report'>('landing');

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        currentView === 'landing' || currentView === 'report'
          ? 'bg-grid-paper text-slate-900 selection:bg-emerald-400 selection:text-slate-950'
          : 'bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white overflow-hidden'
      }`}
    >
      {/* Hide marketing navbar during active 3D world game for whole desktop view */}
      {currentView !== 'game' && (
        <Navbar currentView={currentView} onNavigate={setCurrentView} />
      )}

      <main className={currentView === 'game' ? 'w-screen h-screen overflow-hidden' : 'flex-1 pt-20 sm:pt-24'}>
        {currentView === 'landing' && (
          <LandingPage
            onStartGame={() => setCurrentView('game')}
            onOpenReport={() => setCurrentView('report')}
          />
        )}

        {currentView === 'game' && (
          <WorldPage
            onExit={() => setCurrentView('landing')}
            onOpenTeacherReport={() => setCurrentView('report')}
          />
        )}

        {currentView === 'report' && <TeacherDashboard />}
      </main>
    </div>
  );
}

export default App;

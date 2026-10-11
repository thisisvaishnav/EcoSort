import { lazy, Suspense, useState } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';

// Code-split the heavy routes: the landing page must not download three.js
// (world chunk) or the teacher dashboard bundle until the user navigates there.
const WorldPage = lazy(() =>
  import('./components/world/WorldPage').then((m) => ({ default: m.WorldPage }))
);
const TeacherDashboard = lazy(() =>
  import('./components/teacher/TeacherDashboard').then((m) => ({ default: m.TeacherDashboard }))
);

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'game' | 'report'>('landing');
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);

  const handleStartGame = (levelId = 1) => {
    setSelectedLevelId(levelId);
    setCurrentView('game');
  };

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

      <main className={currentView === 'game' ? 'w-screen h-dvh overflow-hidden' : 'flex-1 pt-20 sm:pt-24'}>
        {currentView === 'landing' && (
          <LandingPage
            onStartGame={() => handleStartGame(1)}
            onStartMeadows={() => handleStartGame(7)}
            onStartMigsun={() => handleStartGame(8)}
            onOpenReport={() => setCurrentView('report')}
          />
        )}

        {currentView === 'game' && (
          <Suspense fallback={<RouteFallback />}>
            <WorldPage
              initialLevelId={selectedLevelId}
              onExit={() => setCurrentView('landing')}
              onOpenTeacherReport={() => setCurrentView('report')}
            />
          </Suspense>
        )}

        {currentView === 'report' && (
          <Suspense fallback={<RouteFallback />}>
            <TeacherDashboard />
          </Suspense>
        )}
      </main>
    </div>
  );
}

export default App;

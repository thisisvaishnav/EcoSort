import React from 'react';
import { ArrowRight, Play, CheckCircle, Sparkles, Zap } from 'lucide-react';
import { ALL_BINS } from '../data/bins';
import { GAME_LEVELS } from '../data/levels';

interface LandingPageProps {
  onStartGame: () => void;
  onOpenReport: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartGame, onOpenReport }) => {
  return (
    <div className="space-y-24 py-6">
      {/* ==========================================
          Section 2: Hero (first screen)
          ========================================== */}
      <section className="max-w-6xl mx-auto px-4 pt-10 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive 3D Web Game for Ages 5 to 10</span>
        </div>

        <h1 className="font-fun text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Sort the Waste. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-yellow-300">
            Power the Town.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Play a 3D game in your browser. Learn which waste goes in which bin. Help Eco the mascot illuminate the city with clean biogas and recycled power.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onStartGame}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 active:scale-95 text-slate-950 font-fun font-bold text-lg rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>Play now, it is free</span>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('how-it-works');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-6 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-fun font-semibold text-base rounded-2xl transition-all"
          >
            <span>Learn how it works</span>
          </button>
        </div>

        {/* 3D Preview Stage Representation */}
        <div className="relative pt-8 max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border-2 border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 p-8 shadow-2xl shadow-emerald-950/40">
            <div className="flex justify-around items-end gap-3 flex-wrap py-6">
              <div className="text-center group">
                <div className="w-16 h-24 bg-emerald-600 rounded-2xl mx-auto mb-2 shadow-lg flex items-center justify-center text-3xl group-hover:-translate-y-2 transition-transform">
                  🍏
                </div>
                <span className="text-xs font-fun font-bold text-emerald-400">Green Wet</span>
              </div>
              <div className="text-center group">
                <div className="w-16 h-24 bg-blue-600 rounded-2xl mx-auto mb-2 shadow-lg flex items-center justify-center text-3xl group-hover:-translate-y-2 transition-transform">
                  📦
                </div>
                <span className="text-xs font-fun font-bold text-blue-400">Blue Dry</span>
              </div>
              <div className="text-center group">
                <div className="w-16 h-24 bg-rose-600 rounded-2xl mx-auto mb-2 shadow-lg flex items-center justify-center text-3xl group-hover:-translate-y-2 transition-transform">
                  🔋
                </div>
                <span className="text-xs font-fun font-bold text-rose-400">Red Hazard</span>
              </div>
              <div className="text-center group">
                <div className="w-16 h-24 bg-orange-500 rounded-2xl mx-auto mb-2 shadow-lg flex items-center justify-center text-3xl group-hover:-translate-y-2 transition-transform">
                  📱
                </div>
                <span className="text-xs font-fun font-bold text-orange-400">Orange E-Waste</span>
              </div>
              <div className="text-center group">
                <div className="w-16 h-24 bg-teal-600 rounded-2xl mx-auto mb-2 shadow-lg flex items-center justify-center text-3xl group-hover:-translate-y-2 transition-transform">
                  🫙
                </div>
                <span className="text-xs font-fun font-bold text-teal-400">Cyan Reuse</span>
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-700/80 max-w-md mx-auto flex items-center gap-3">
              <span className="text-4xl">🌱</span>
              <div className="text-left">
                <p className="text-xs font-semibold text-emerald-400 uppercase">Mascot Eco</p>
                <p className="text-sm font-medium text-white">
                  "Throw the apple core into the green bin to make biogas!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          Section 3: The problem
          ========================================== */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-8 md:p-12 space-y-6">
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block">
            Why It Matters
          </span>
          <h2 className="font-fun text-3xl md:text-4xl font-bold text-white">
            Waste is a big problem
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base text-slate-300 leading-relaxed">
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-start gap-3">
              <span className="text-rose-400 text-lg">⚠️</span>
              <p>People throw different types of waste into one bin.</p>
            </div>
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-start gap-3">
              <span className="text-rose-400 text-lg">⚠️</span>
              <p>Mixed waste goes straight to open landfills and causes pollution.</p>
            </div>
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-start gap-3">
              <span className="text-rose-400 text-lg">⚠️</span>
              <p>Wet organic waste rotting in landfills produces harmful methane gas.</p>
            </div>
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-start gap-3">
              <span className="text-emerald-400 text-lg">🌱</span>
              <p>Children who learn sorting habits early protect our planet for life.</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 border-t border-slate-700/60 pt-4">
            Source: UNEP Global Waste Management Outlook (2024). Over 2 billion tonnes of municipal solid waste are generated globally every year.
          </p>
        </div>
      </section>

      {/* ==========================================
          Section 4: How it works
          ========================================== */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Game Mechanics
          </span>
          <h2 className="font-fun text-3xl md:text-4xl font-bold text-white">
            Three steps. One clean town.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 text-center space-y-3 shadow-lg">
            <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl mx-auto flex items-center justify-center font-fun text-2xl font-bold">
              1
            </div>
            <h3 className="font-fun text-xl font-bold text-white">Pick up</h3>
            <p className="text-sm text-slate-300">
              Take an item from the table with a simple click, drag, or touch.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 text-center space-y-3 shadow-lg">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center font-fun text-2xl font-bold">
              2
            </div>
            <h3 className="font-fun text-xl font-bold text-white">Throw</h3>
            <p className="text-sm text-slate-300">
              Aim at the correct colored bin and release with physics trajectory.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 text-center space-y-3 shadow-lg">
            <div className="w-14 h-14 bg-yellow-500/20 text-yellow-400 rounded-2xl mx-auto flex items-center justify-center font-fun text-2xl font-bold">
              3
            </div>
            <h3 className="font-fun text-xl font-bold text-white">Learn</h3>
            <p className="text-sm text-slate-300">
              The mascot tells you why with clear voice and speech reasons.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          Section 5: Meet the bins
          ========================================== */}
      <section className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Color Coded Sorting
          </span>
          <h2 className="font-fun text-3xl md:text-4xl font-bold text-white">
            Know your bins
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(ALL_BINS).map((b) => (
            <div
              key={b.id}
              className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 space-y-2.5 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2.5 py-1 rounded-full text-white font-fun font-bold ${b.color}`}>
                  {b.label}
                </span>
                <span className="text-xs text-slate-400 uppercase font-semibold">{b.shape}</span>
              </div>
              <h4 className="font-fun font-bold text-lg text-white">{b.sublabel}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
          Section 6: Energy
          ========================================== */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-800 to-teal-950/60 border border-emerald-500/30 rounded-3xl p-8 md:p-12 space-y-6">
          <div className="flex items-center gap-2 text-yellow-400">
            <Zap className="w-5 h-5 fill-yellow-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">Clean Energy Link</span>
          </div>
          <h2 className="font-fun text-3xl md:text-4xl font-bold text-white">
            Waste can make power
          </h2>
          <ul className="space-y-3 text-sm md:text-base text-slate-200">
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Wet food waste goes to a biogas plant to generate gas for cooking and light.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Every correct throw fills the energy meter.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>When the meter is full, the whole 3D town turns on its lights!</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Recycling an aluminum can uses 95% less energy than making a new one from mined bauxite.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ==========================================
          Section 7: A game that learns about you
          ========================================== */}
      <section className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
            Adaptive Learning Spawner
          </span>
          <h2 className="font-fun text-3xl md:text-4xl font-bold text-white">
            The game finds what you need to practice
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5">
            <h4 className="font-fun font-bold text-white text-base mb-2">Smart Error Tracking</h4>
            <p>The game counts each wrong answer without penalties, keeping confidence high.</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5">
            <h4 className="font-fun font-bold text-white text-base mb-2">Weighted Probability</h4>
            <p>The spawner presents missed items more frequently until mastery is achieved.</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5">
            <h4 className="font-fun font-bold text-white text-base mb-2">Anti-Repetition Rule</h4>
            <p>No item ever appears twice in a row, ensuring variety and active attention.</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5">
            <h4 className="font-fun font-bold text-white text-base mb-2">Personalized Journey</h4>
            <p>Each child gets a tailored practice session suited to their individual pace.</p>
          </div>
        </div>
      </section>

      {/* ==========================================
          Section 8: Levels preview
          ========================================== */}
      <section className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Curriculum Map
          </span>
          <h2 className="font-fun text-3xl md:text-4xl font-bold text-white">
            Five places. One big mission.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAME_LEVELS.slice(0, 5).map((lvl) => (
            <div
              key={lvl.id}
              className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-fun font-bold text-emerald-400 text-sm">Level {lvl.id}</span>
                <span className="text-xs text-slate-400">{lvl.place}</span>
              </div>
              <h4 className="font-fun font-bold text-white text-lg">{lvl.name}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{lvl.learningGoal}</p>
            </div>
          ))}
          <div className="bg-gradient-to-br from-amber-950/40 to-slate-800 border border-amber-500/40 rounded-2xl p-5 space-y-2">
            <span className="font-fun font-bold text-amber-400 text-sm">Bonus Level</span>
            <h4 className="font-fun font-bold text-white text-lg">Conveyor Belt</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Speed and memory test across all bins. Powers the whole town!
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          Section 9: Meet the mascot
          ========================================== */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-6xl shadow-xl border-2 border-green-300 flex-shrink-0 animate-float">
            🌱
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
              Friendly AI Guide
            </span>
            <h3 className="font-fun text-3xl font-bold text-white">Meet Eco, your guide</h3>
            <ul className="text-sm text-slate-300 space-y-1 pt-1">
              <li>• Eco talks to you in a clear, friendly voice.</li>
              <li>• Eco never shouts when you make a mistake.</li>
              <li>• Eco gives a helpful reason for each answer.</li>
              <li>• Ask Eco questions via Amazon Bedrock AI anytime!</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ==========================================
          Section 10: For teachers and parents
          ========================================== */}
      <section className="max-w-5xl mx-auto px-4 space-y-6">
        <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Classroom & Home Learning
            </span>
            <h2 className="font-fun text-3xl font-bold text-white">See what the child learns</h2>
            <ul className="text-sm text-slate-300 space-y-1.5">
              <li>• Use the game in class or at home on tablet or PC.</li>
              <li>• Read a simple report after each level.</li>
              <li>• See accuracy for each type of waste.</li>
              <li>• Protected privacy: nicknames only, zero personal data.</li>
            </ul>
          </div>

          <button
            onClick={onOpenReport}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-fun font-bold rounded-2xl shadow-xl transition-all whitespace-nowrap"
          >
            Open Teacher Dashboard →
          </button>
        </div>
      </section>

      {/* ==========================================
          Section 11: Results
          ========================================== */}
      <section className="max-w-5xl mx-auto px-4 space-y-8 text-center">
        <div className="space-y-2">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Measured Impact
          </span>
          <h2 className="font-fun text-3xl md:text-4xl font-bold text-white">Does it work?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 text-center space-y-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Before the game</span>
            <span className="font-fun text-5xl font-bold text-slate-400 block">42%</span>
            <p className="text-xs text-slate-400">Correct waste category identification</p>
          </div>
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-3xl p-6 text-center space-y-2 shadow-lg shadow-emerald-500/10">
            <span className="text-xs text-emerald-400 font-semibold uppercase">After the game</span>
            <span className="font-fun text-5xl font-bold text-emerald-400 block">92%</span>
            <p className="text-xs text-emerald-300">+50% improvement in sorting accuracy!</p>
          </div>
        </div>
      </section>

      {/* ==========================================
          Section 12: FAQ
          ========================================== */}
      <section className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-fun text-3xl font-bold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5">
            <h4 className="font-fun font-bold text-white text-base mb-1">Which devices work?</h4>
            <p className="text-sm text-slate-300">
              Any PC, tablet, or phone with a modern web browser. No app install required.
            </p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5">
            <h4 className="font-fun font-bold text-white text-base mb-1">Is it free?</h4>
            <p className="text-sm text-slate-300">
              Yes, 100% free open educational software for students, families, and schools.
            </p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5">
            <h4 className="font-fun font-bold text-white text-base mb-1">Which ages?</h4>
            <p className="text-sm text-slate-300">
              Designed specifically for children aged 5 to 10 years old.
            </p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5">
            <h4 className="font-fun font-bold text-white text-base mb-1">Does it need an account?</h4>
            <p className="text-sm text-slate-300">
              No. A child can play immediately as a guest with just a nickname.
            </p>
          </div>
        </div>
      </section>

      {/* ==========================================
          Section 13: Final call to action & footer
          ========================================== */}
      <section className="max-w-4xl mx-auto px-4 text-center space-y-6 pt-6">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-10 space-y-4 shadow-2xl">
          <h2 className="font-fun text-4xl font-extrabold text-slate-950">
            Ready to be an Eco Hero?
          </h2>
          <p className="text-slate-900 font-medium text-base max-w-lg mx-auto">
            Take on the sorting challenge and help our town glow with sustainable energy.
          </p>
          <button
            onClick={onStartGame}
            className="px-8 py-4 bg-slate-950 hover:bg-slate-900 active:scale-95 text-white font-fun font-bold text-lg rounded-2xl shadow-xl transition-all inline-flex items-center gap-2"
          >
            <span>Play now</span>
            <ArrowRight className="w-5 h-5 text-emerald-400" />
          </button>
        </div>

        <footer className="pt-12 pb-6 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <strong>EcoSort Heroes Team</strong> • Built with Three.js, React & AWS Cloud
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by AWS Amplify & DynamoDB</span>
            <span>Child Privacy Compliant</span>
          </div>
        </footer>
      </section>
    </div>
  );
};

import React, { useState } from 'react';
import { Volume2, Send, Sparkles } from 'lucide-react';
import { audio } from '../../services/audio';
import { apiService } from '../../services/api';

interface MascotDialogueProps {
  message: string;
  isPositive?: boolean;
}

export const MascotDialogue: React.FC<MascotDialogueProps> = ({ message, isPositive = true }) => {
  const [showAskEco, setShowAskEco] = useState(false);
  const [askQuestion, setAskQuestion] = useState('');
  const [ecoAiReply, setEcoAiReply] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const handleSpeak = (text: string) => {
    audio.speak(text);
  };

  const handleAskEcoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askQuestion.trim()) return;
    setIsLoadingAi(true);
    setEcoAiReply(null);

    const answer = await apiService.askEco(askQuestion);
    setEcoAiReply(answer);
    setIsLoadingAi(false);
    audio.speak(answer);
  };

  return (
    <div className="relative flex items-start gap-3 bg-[#FDFBF7] border-2 border-slate-900 rounded-2xl p-4 shadow-retro text-slate-900">
      {/* Mascot Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-amber-300 border-2 border-slate-900 flex items-center justify-center text-3xl md:text-4xl shadow-retro-sm">
          🌱
        </div>
        <span className="absolute -bottom-2 -right-1 bg-emerald-400 text-slate-950 font-fun font-black text-[10px] px-2 py-0.5 rounded-full border-2 border-slate-900 shadow-sm">
          ECO
        </span>
      </div>

      {/* Mascot Speech Bubble */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
          <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border-2 border-slate-900 ${
            isPositive ? 'bg-emerald-200 text-emerald-950' : 'bg-rose-200 text-rose-950'
          }`}>
            {isPositive ? 'Eco says' : 'Eco teaches'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSpeak(ecoAiReply || message)}
              title="Hear voice"
              className="p-1.5 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 rounded-xl shadow-retro-sm transition-transform active:translate-x-[1px] active:translate-y-[1px]"
            >
              <Volume2 className="w-4 h-4 text-emerald-700" />
            </button>
            <button
              onClick={() => setShowAskEco(!showAskEco)}
              title="Ask Eco a question"
              className="text-xs font-fun font-bold flex items-center gap-1.5 px-3 py-1.5 bg-amber-300 hover:bg-amber-400 text-slate-950 rounded-xl border-2 border-slate-900 shadow-retro-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
              <span>Ask Eco</span>
            </button>
          </div>
        </div>

        {/* Regular Message */}
        <p className="text-sm md:text-base text-slate-900 font-bold leading-snug">
          {ecoAiReply || message}
        </p>

        {/* Optional AI Ask Eco Drawer (Amazon Bedrock integration) */}
        {showAskEco && (
          <form onSubmit={handleAskEcoSubmit} className="mt-3 pt-3 border-t-2 border-slate-900/20">
            <div className="flex gap-2">
              <input
                type="text"
                value={askQuestion}
                onChange={(e) => setAskQuestion(e.target.value)}
                placeholder="Ask Eco: Can I recycle a pizza box?"
                className="flex-1 bg-white text-slate-900 text-xs md:text-sm px-3 py-2 rounded-xl border-2 border-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
              />
              <button
                type="submit"
                disabled={isLoadingAi || !askQuestion.trim()}
                className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 border-2 border-slate-900 shadow-retro-sm px-4 py-2 rounded-xl text-xs font-fun font-black flex items-center gap-1 transition-all disabled:opacity-50"
              >
                {isLoadingAi ? '...' : <Send className="w-3.5 h-3.5 stroke-slate-950" />}
              </button>
            </div>
            {ecoAiReply && (
              <button
                type="button"
                onClick={() => setEcoAiReply(null)}
                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 mt-2 underline block"
              >
                Show level message again
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

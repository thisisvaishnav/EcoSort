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
    <div className="relative flex items-start gap-3 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl backdrop-blur-md">
      {/* Mascot Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-3xl md:text-4xl shadow-lg border-2 border-green-300 animate-float">
          🌱
        </div>
        <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-slate-900 font-fun font-bold text-[10px] px-1.5 py-0.5 rounded-full border border-slate-900">
          Eco
        </span>
      </div>

      {/* Mascot Speech Bubble */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">
            {isPositive ? 'Eco says:' : 'Eco teaches:'}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleSpeak(ecoAiReply || message)}
              title="Hear voice"
              className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAskEco(!showAskEco)}
              title="Ask Eco a question"
              className="text-xs flex items-center gap-1 px-2 py-1 bg-green-600/30 text-green-300 hover:bg-green-600/50 rounded-lg transition-colors border border-green-500/30"
            >
              <Sparkles className="w-3 h-3" />
              <span>Ask Eco</span>
            </button>
          </div>
        </div>

        {/* Regular Message */}
        <p className="text-sm md:text-base text-slate-100 font-medium leading-snug">
          {ecoAiReply || message}
        </p>

        {/* Optional AI Ask Eco Drawer (Amazon Bedrock integration) */}
        {showAskEco && (
          <form onSubmit={handleAskEcoSubmit} className="mt-3 pt-3 border-t border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={askQuestion}
                onChange={(e) => setAskQuestion(e.target.value)}
                placeholder="Ask Eco: Can I recycle a pizza box?"
                className="flex-1 bg-slate-900 text-white text-xs md:text-sm px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-green-500"
              />
              <button
                type="submit"
                disabled={isLoadingAi || !askQuestion.trim()}
                className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
              >
                {isLoadingAi ? '...' : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
            {ecoAiReply && (
              <button
                type="button"
                onClick={() => setEcoAiReply(null)}
                className="text-[11px] text-slate-400 hover:text-slate-200 mt-1 underline"
              >
                Reset to game message
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

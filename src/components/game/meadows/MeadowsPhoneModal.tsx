import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneCall, PhoneOff, User, Truck, Volume2, Wifi, Battery } from 'lucide-react';
import { audio } from '../../../services/audio';

export interface MeadowsPhoneModalProps {
  isOpen: boolean;
  onCallFinished: () => void;
}

type CallStage =
  | 'CONTACTS'        // Shows Municipal Waste Collection & Call button
  | 'RINGING'         // Dialing and ringing animation
  | 'DIALOGUE_DISP_1' // Dispatcher: "Municipal waste control. How can I help?"
  | 'DIALOGUE_PLAYER' // Player: "There is a large waste pile at Green Meadows Residency. Please send a truck."
  | 'DIALOGUE_DISP_2' // Dispatcher: "Understood. A truck is on its way. Please sort the waste into the right bins before we arrive."
  | 'COMPLETED';

export const MeadowsPhoneModal: React.FC<MeadowsPhoneModalProps> = ({
  isOpen,
  onCallFinished,
}) => {
  const [stage, setStage] = useState<CallStage>('CONTACTS');
  const [currentTime, setCurrentTime] = useState('10:42');
  const ringIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    setCurrentTime(`${hrs}:${mins}`);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
      if (flowTimerRef.current) clearTimeout(flowTimerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const handleStartCall = () => {
    audio.playPhoneBeep();
    setStage('RINGING');
    audio.playPhoneRing();

    // Ring twice
    let ringCount = 1;
    ringIntervalRef.current = setInterval(() => {
      audio.playPhoneRing();
      ringCount++;
      if (ringCount >= 2) {
        if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
        // Connect the call
        startDialogueSequence();
      }
    }, 1800);
  };

  const startDialogueSequence = () => {
    // 1. Dispatcher Greeting
    setStage('DIALOGUE_DISP_1');
    const disp1 = 'Municipal waste control. How can I help?';
    audio.speak(disp1);

    // 2. Player Response after 4.2s
    flowTimerRef.current = setTimeout(() => {
      setStage('DIALOGUE_PLAYER');
      const playerMsg = 'There is a large waste pile at Green Meadows Residency. Please send a truck.';
      audio.speak(playerMsg);

      // 3. Dispatcher Instructions after 5.6s
      flowTimerRef.current = setTimeout(() => {
        setStage('DIALOGUE_DISP_2');
        const disp2 = 'Understood. A truck is on its way. Please sort the waste into the right bins before we arrive.';
        audio.speak(disp2);

        // 4. Hang up & finish after 6.5s
        flowTimerRef.current = setTimeout(() => {
          setStage('COMPLETED');
          audio.playPhoneBeep();
          // Give 0.4s for hangup transition before unmounting
          setTimeout(() => {
            onCallFinished();
          }, 450);
        }, 6500);
      }, 5600);
    }, 4200);
  };

  return (
    <div
      data-testid="meadows-phone-overlay"
      className="fixed inset-0 z-50 pointer-events-auto flex items-end justify-center sm:justify-end p-2 sm:pr-8 sm:pb-6"
    >
      {/* Background dimmer & blur for the 3D world */}
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-500" />

      {/* Smartphone Container: Ultra-compact, responsive, matching 35-40% height max */}
      <div
        className={`relative z-10 w-[240px] xs:w-[260px] sm:w-[300px] max-w-[85vw] h-auto max-h-[42dvh] sm:max-h-[50dvh] bg-[#FDFBF7] border-[2.5px] sm:border-[3px] border-slate-950 rounded-[1.5rem] sm:rounded-[2rem] shadow-retro-xl flex flex-col overflow-hidden text-slate-900 transition-all transform duration-500 ease-out mb-1 sm:mb-2 ${
          stage === 'COMPLETED' ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        {/* Smartphone Dynamic Island / Notch */}
        <div className="w-full flex justify-center pt-1.5 pb-0.5 shrink-0 bg-[#FDFBF7]">
          <div className="w-14 sm:w-18 h-2.5 sm:h-3 bg-slate-950 rounded-full flex items-center justify-center gap-1 px-1.5 shadow-inner">
            <div className="w-1 h-1 rounded-full bg-slate-800" />
            <div className="w-4 h-0.5 rounded-full bg-slate-700" />
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-3 sm:px-4 py-0.5 flex items-center justify-between text-[9px] sm:text-[10px] font-sans font-black text-slate-700 shrink-0">
          <span>{currentTime}</span>
          <div className="flex items-center gap-1 text-slate-800">
            <Wifi className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[2.5]" />
            <Battery className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[2.5]" />
          </div>
        </div>

        {/* Phone Content Screen */}
        <div className="flex-1 flex flex-col px-2.5 sm:px-3.5 py-1 overflow-y-auto">
          {stage === 'CONTACTS' && (
            <div className="flex-1 flex flex-col justify-between items-center text-center py-1 gap-1.5 animate-in fade-in duration-300">
              {/* App Header */}
              <div className="w-full text-left border-b border-slate-950/15 pb-0.5">
                <span className="text-[8px] uppercase tracking-wider text-emerald-700 font-fun font-black">Contacts</span>
                <h3 className="text-[11px] sm:text-xs font-fun font-black text-slate-950 flex items-center gap-1">
                  <span>Waste Dispatch</span>
                </h3>
              </div>

              {/* Contact Card */}
              <div className="flex flex-col items-center my-auto py-0.5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 border-2 border-slate-950 flex items-center justify-center mb-1 shadow-retro-xs">
                  <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-700" />
                </div>
                <h2 className="text-[11px] sm:text-xs font-fun font-black text-slate-950 flex items-center gap-1 leading-tight">
                  Municipal Waste Collection 🚛
                </h2>
                <p className="text-[9px] text-slate-600 font-semibold mt-0.5">Green Meadows Service</p>
              </div>

              {/* Big Green CALL Button */}
              <button
                data-testid="call-garbage-truck-btn"
                onClick={handleStartCall}
                className="w-full py-2 px-2.5 bg-emerald-500 hover:bg-emerald-400 active:translate-x-[1px] active:translate-y-[1px] text-slate-950 font-fun font-black text-[10px] sm:text-xs uppercase tracking-wider rounded-xl border-2 border-slate-950 shadow-retro-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer animate-pulse"
              >
                <PhoneCall className="w-3.5 h-3.5 fill-slate-950 stroke-slate-950" />
                <span>CALL GARBAGE TRUCK</span>
              </button>
            </div>
          )}

          {stage === 'RINGING' && (
            <div className="flex-1 flex flex-col justify-between items-center text-center py-1.5 gap-1.5 animate-in fade-in duration-300">
              <div className="flex flex-col items-center">
                <div className="text-[9px] text-emerald-700 uppercase tracking-widest font-fun font-black">Calling...</div>
                <h2 className="text-[11px] sm:text-xs font-fun font-black text-slate-950 mt-0.5">
                  Municipal Waste Collection
                </h2>
              </div>

              {/* Ringing Radar Pulses */}
              <div className="relative flex items-center justify-center my-auto py-1">
                <div className="absolute w-14 sm:w-18 h-14 sm:h-18 rounded-full border-2 border-emerald-400/40 animate-ping" />
                <div className="absolute w-10 sm:w-12 h-10 sm:h-12 rounded-full border-2 border-emerald-500/50 animate-pulse" />
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center shadow-retro-xs">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 animate-bounce" />
                </div>
              </div>

              <div className="text-[9px] text-slate-600 font-bold flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-950/20">
                <Volume2 className="w-2.5 h-2.5 text-emerald-600" />
                <span>Connecting to Green Meadows...</span>
              </div>
            </div>
          )}

          {(stage === 'DIALOGUE_DISP_1' || stage === 'DIALOGUE_PLAYER' || stage === 'DIALOGUE_DISP_2') && (
            <div className="flex-1 flex flex-col justify-between py-1 gap-1 animate-in fade-in duration-300">
              {/* Call in progress info header */}
              <div className="flex items-center justify-between border-b border-slate-950/15 pb-0.5">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] sm:text-[10px] font-fun font-black text-emerald-800">Call Connected</span>
                </div>
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-500">Waste Dispatch</span>
              </div>

              {/* GTA-Style Voice Call Dialogue Bubbles */}
              <div className="flex-1 flex flex-col justify-center gap-1.5 my-1 px-0.5">
                {stage === 'DIALOGUE_DISP_1' && (
                  <div className="bg-white border-2 border-slate-950 rounded-lg sm:rounded-xl p-2 shadow-retro-xs animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-1 text-[9px] font-fun font-black text-emerald-700 mb-0.5">
                      <Truck className="w-2.5 h-2.5" />
                      <span>Dispatcher</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] font-fun font-bold text-slate-900 leading-snug">
                      "Municipal waste control. How can I help?"
                    </p>
                  </div>
                )}

                {stage === 'DIALOGUE_PLAYER' && (
                  <div className="bg-emerald-50 border-2 border-slate-950 rounded-lg sm:rounded-xl p-2 shadow-retro-xs ml-auto max-w-[95%] animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-1 text-[9px] font-fun font-black text-emerald-800 mb-0.5 justify-end">
                      <span>Kai (Player)</span>
                      <User className="w-2.5 h-2.5" />
                    </div>
                    <p className="text-[10px] sm:text-[11px] font-fun font-bold text-slate-950 leading-snug text-right">
                      "There is a large waste pile at Green Meadows Residency. Please send a truck."
                    </p>
                  </div>
                )}

                {stage === 'DIALOGUE_DISP_2' && (
                  <div className="bg-white border-2 border-slate-950 rounded-lg sm:rounded-xl p-2 shadow-retro-xs animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-1 text-[9px] font-fun font-black text-emerald-700 mb-0.5">
                      <Truck className="w-2.5 h-2.5" />
                      <span>Dispatcher</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] font-fun font-bold text-slate-900 leading-snug">
                      "Understood. A truck is on its way. Please sort the waste into the right bins before we arrive."
                    </p>
                  </div>
                )}
              </div>

              {/* Active Speaker Footer */}
              <div className="w-full flex justify-center pt-0.5">
                <div className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-950/20 text-[8px] text-slate-700 font-bold flex items-center gap-1">
                  <Volume2 className="w-2 h-2 text-emerald-600 animate-pulse" />
                  <span>Dispatcher active</span>
                </div>
              </div>
            </div>
          )}

          {stage === 'COMPLETED' && (
            <div className="flex-1 flex items-center justify-center py-2">
              <div className="flex items-center gap-1 text-rose-600 font-fun font-black text-[10px]">
                <PhoneOff className="w-3 h-3" />
                <span>Call ended</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="w-full flex justify-center pb-1 pt-0.5 bg-[#FDFBF7]">
          <div className="w-16 h-1 bg-slate-400 rounded-full" />
        </div>
      </div>
    </div>
  );
};

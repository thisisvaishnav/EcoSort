import React, { useState } from 'react';
import { X, User, Check } from 'lucide-react';
import { PlayerProfile } from '../../types/game';

interface AvatarSelectModalProps {
  currentProfile: PlayerProfile;
  onSaveProfile: (profile: PlayerProfile) => void;
  onClose: () => void;
}

const AVATARS = ['🦊', '🐼', '🦁', '🦉', '🐢', '🐬', '🐝', '🌿'];

export const AvatarSelectModal: React.FC<AvatarSelectModalProps> = ({
  currentProfile,
  onSaveProfile,
  onClose,
}) => {
  const [nickname, setNickname] = useState(currentProfile.nickname);
  const [selectedAvatar, setSelectedAvatar] = useState(currentProfile.avatar);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNick = nickname.trim().slice(0, 16) || 'EcoHero';
    onSaveProfile({
      ...currentProfile,
      nickname: cleanNick,
      avatar: selectedAvatar,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#FDFBF7] border-2 border-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-retro-xl text-slate-900 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-300 border-2 border-slate-900 text-slate-950 rounded-xl shadow-retro-sm">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-fun text-xl font-black text-slate-950">Hero Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 rounded-xl shadow-retro-sm transition-transform active:translate-x-[1px] active:translate-y-[1px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
              Choose Your Mascot Avatar
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVATARS.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => setSelectedAvatar(av)}
                  className={`p-3 text-3xl rounded-2xl border-2 border-slate-900 transition-all ${
                    selectedAvatar === av
                      ? 'bg-amber-300 scale-105 shadow-retro-sm'
                      : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Hero Nickname (No real name needed)
            </label>
            <input
              type="text"
              value={nickname}
              maxLength={16}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. GreenRanger"
              className="w-full bg-white border-2 border-slate-900 rounded-xl px-3.5 py-2.5 text-slate-950 font-fun font-bold text-base focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <span className="text-[11px] font-bold text-slate-500 mt-1 block">
              Child privacy protected: we do not store real names or emails.
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-300 hover:bg-amber-400 text-slate-950 font-fun font-black rounded-xl border-2 border-slate-900 shadow-retro transition-all flex items-center justify-center gap-2 text-base active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <Check className="w-5 h-5 stroke-slate-950" />
            <span>Save Profile</span>
          </button>
        </form>
      </div>
    </div>
  );
};

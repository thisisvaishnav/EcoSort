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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-fun text-xl font-bold text-white">Hero Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Choose Your Mascot Avatar
            </label>
            <div className="grid grid-cols-4 gap-2">
              {AVATARS.map((av) => (
                <button
                  type="button"
                  key={av}
                  onClick={() => setSelectedAvatar(av)}
                  className={`p-3 text-3xl rounded-2xl border-2 transition-all ${
                    selectedAvatar === av
                      ? 'bg-blue-600/30 border-blue-400 scale-105 shadow-md'
                      : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Hero Nickname (No real name needed!)
            </label>
            <input
              type="text"
              value={nickname}
              maxLength={16}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. GreenRanger"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-fun text-base focus:outline-none focus:border-blue-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              We protect child privacy: no email or real names are stored.
            </span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-fun font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-base"
          >
            <Check className="w-5 h-5" />
            <span>Save Profile</span>
          </button>
        </form>
      </div>
    </div>
  );
};

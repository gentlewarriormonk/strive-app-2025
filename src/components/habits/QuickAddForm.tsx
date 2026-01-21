'use client';

import { useState } from 'react';
import { HabitVisibility } from '@/types/models';

interface QuickAddFormProps {
  onClose: () => void;
  onSubmit: (data: QuickAddData) => void | Promise<void>;
}

export interface QuickAddData {
  name: string;
  visibility: HabitVisibility;
}

export function QuickAddForm({ onClose, onSubmit }: QuickAddFormProps) {
  const [name, setName] = useState('');
  const [visibility, setVisibility] = useState<HabitVisibility>('PUBLIC_TO_CLASS');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({ name: name.trim(), visibility });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add habit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#111f22] border border-[#325e67]/50 rounded-xl shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#325e67]/50">
          <h2 className="text-xl font-bold text-white">Quick Add</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Habit Name */}
            <label className="block">
              <span className="text-white text-base font-medium">Habit Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field w-full mt-2"
                placeholder="e.g., Drink 8 glasses of water"
                autoFocus
                required
              />
            </label>

            {/* Visibility */}
            <fieldset>
              <legend className="text-white text-base font-medium mb-3">Who can see this?</legend>
              <div className="space-y-2">
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    visibility === 'PUBLIC_TO_CLASS'
                      ? 'border-[#13c8ec] bg-[#13c8ec]/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value="PUBLIC_TO_CLASS"
                    checked={visibility === 'PUBLIC_TO_CLASS'}
                    onChange={() => setVisibility('PUBLIC_TO_CLASS')}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      visibility === 'PUBLIC_TO_CLASS' ? 'border-[#13c8ec]' : 'border-white/40'
                    }`}
                  >
                    {visibility === 'PUBLIC_TO_CLASS' && (
                      <div className="w-2 h-2 rounded-full bg-[#13c8ec]" />
                    )}
                  </div>
                  <span className="text-white text-sm">My group (teacher + classmates)</span>
                </label>
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    visibility === 'PRIVATE_TO_PEERS'
                      ? 'border-[#13c8ec] bg-[#13c8ec]/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value="PRIVATE_TO_PEERS"
                    checked={visibility === 'PRIVATE_TO_PEERS'}
                    onChange={() => setVisibility('PRIVATE_TO_PEERS')}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      visibility === 'PRIVATE_TO_PEERS' ? 'border-[#13c8ec]' : 'border-white/40'
                    }`}
                  >
                    {visibility === 'PRIVATE_TO_PEERS' && (
                      <div className="w-2 h-2 rounded-full bg-[#13c8ec]" />
                    )}
                  </div>
                  <span className="text-white text-sm">Teacher only</span>
                </label>
              </div>
            </fieldset>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#325e67]/50">
            {error && (
              <p className="text-red-400 text-sm mb-3">{error}</p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#13c8ec] text-[#101f22] font-bold hover:bg-[#0ea5c7] transition-colors disabled:opacity-40"
              >
                {isSubmitting ? 'Adding...' : 'Add Habit'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

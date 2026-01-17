'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface JoinClassFormProps {
  onClose: () => void;
  onSuccess: (group: { id: string; name: string; teacherName: string }) => void;
}

export function JoinClassForm({ onClose, onSuccess }: JoinClassFormProps) {
  const [joinCode, setJoinCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode: joinCode.trim().toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join group');
      }

      setSuccessMessage(`Successfully joined ${data.group.name}!`);
      onSuccess(data.group);

      // Close after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-[#111f22] border border-[#325e67]/50 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center gap-2 px-6 py-4 border-b border-[#325e67]/50">
          <div>
            <h2 className="text-xl font-bold text-white">Join a Group</h2>
            <p className="text-sm text-[#92c0c9]">
              Enter the code to join a group
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* Join Code Input */}
            <label className="block">
              <span className="text-white text-base font-medium">Join Code</span>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="input-field w-full mt-2 text-center text-2xl font-mono tracking-widest uppercase"
                placeholder="ABCD1234"
                maxLength={8}
                required
              />
            </label>
            <p className="text-[#92c0c9] text-xs mt-2 text-center">
              Enter the 8-character join code
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#325e67]/50">
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm mb-3">
                <span className="material-symbols-outlined !text-lg">error</span>
                {error}
              </div>
            )}
            {successMessage && (
              <div className="flex items-center gap-2 text-green-400 text-sm mb-3">
                <span className="material-symbols-outlined !text-lg">check_circle</span>
                {successMessage}
              </div>
            )}
            <div className="flex flex-col sm:flex-row-reverse gap-3">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                className="sm:w-auto"
                disabled={isSubmitting || joinCode.length < 8}
              >
                {isSubmitting ? 'Joining...' : 'Join Group'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                fullWidth
                className="sm:w-auto"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

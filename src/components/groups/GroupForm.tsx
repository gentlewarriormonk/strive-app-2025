'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface GroupFormProps {
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => Promise<void>;
}

export function GroupForm({ onClose, onSubmit }: GroupFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({ name, description });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create class');
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
            <h2 className="text-xl font-bold text-white">Create a New Class</h2>
            <p className="text-sm text-[#92c0c9]">
              Set up a class for your students to join
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
          <div className="p-6 space-y-5">
            {/* Class Name */}
            <label className="block">
              <span className="text-white text-base font-medium">Class Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field w-full mt-2"
                placeholder="e.g., Grade 7 Advisory"
                required
              />
            </label>

            {/* Description */}
            <label className="block">
              <span className="text-white text-base font-medium">Description (Optional)</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field w-full mt-2 min-h-[80px] resize-none"
                placeholder="A brief description of this class"
              />
            </label>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#325e67]/50">
            {error && (
              <p className="text-red-400 text-sm mb-3">{error}</p>
            )}
            <div className="flex flex-col sm:flex-row-reverse gap-3">
              <Button type="submit" variant="primary" fullWidth className="sm:w-auto" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Class'}
              </Button>
              <Button type="button" variant="ghost" onClick={onClose} fullWidth className="sm:w-auto" disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

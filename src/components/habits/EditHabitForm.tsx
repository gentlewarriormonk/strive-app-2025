'use client';

import { useState } from 'react';
import { HabitVisibility, ScheduleFrequency } from '@/types/models';

interface EditHabitFormProps {
  onClose: () => void;
  onSubmit: (data: EditHabitData) => void | Promise<void>;
  onDelete?: () => void;
  initialData: EditHabitData & { id: string };
}

export interface EditHabitData {
  name: string;
  cue?: string;
  location?: string;
  obstacle?: string;
  backupPlan?: string;
  scheduleFrequency: ScheduleFrequency;
  scheduleDays: number[];
  visibility: HabitVisibility;
}

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_INDICES = [1, 2, 3, 4, 5, 6, 0]; // Monday first, Sunday last

export function EditHabitForm({ onClose, onSubmit, onDelete, initialData }: EditHabitFormProps) {
  const [formData, setFormData] = useState<EditHabitData>({
    name: initialData.name,
    cue: initialData.cue || '',
    location: initialData.location || '',
    obstacle: initialData.obstacle || '',
    backupPlan: initialData.backupPlan || '',
    scheduleFrequency: initialData.scheduleFrequency || 'DAILY',
    scheduleDays: initialData.scheduleDays || [],
    visibility: initialData.visibility || 'PUBLIC_TO_CLASS',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showIntention, setShowIntention] = useState(
    !!(initialData.cue || initialData.location || initialData.obstacle || initialData.backupPlan)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDay = (dayIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      scheduleDays: prev.scheduleDays.includes(dayIndex)
        ? prev.scheduleDays.filter((d) => d !== dayIndex)
        : [...prev.scheduleDays, dayIndex],
    }));
  };

  const isDaily = formData.scheduleFrequency === 'DAILY';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-hidden bg-[#111f22] border border-[#325e67]/50 rounded-xl shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#325e67]/50">
          <h2 className="text-xl font-bold text-white">Edit Habit</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
            {/* Habit Name */}
            <label className="block">
              <span className="text-white text-base font-medium">Habit Name</span>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field w-full mt-2"
                placeholder="e.g., Meditate for 10 minutes daily"
                required
              />
            </label>

            {/* Implementation Intention Section */}
            <div className="border-t border-[#325e67]/50 pt-6">
              <button
                type="button"
                onClick={() => setShowIntention(!showIntention)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-white text-base font-medium">Implementation Intention</span>
                <span className={`material-symbols-outlined text-[#92c0c9] transition-transform ${showIntention ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              <p className="text-[#92c0c9] text-sm mt-1">
                {showIntention ? 'Define when, where, and how you\'ll do this habit.' : 'Click to add when, where, and backup plans.'}
              </p>

              {showIntention && (
                <div className="mt-4 space-y-4">
                  <label className="block">
                    <span className="text-[#92c0c9] text-sm">Right after I...</span>
                    <input
                      type="text"
                      value={formData.cue}
                      onChange={(e) => setFormData({ ...formData, cue: e.target.value })}
                      className="input-field w-full mt-1"
                      placeholder="e.g., finish my homework"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[#92c0c9] text-sm">Where?</span>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="input-field w-full mt-1"
                      placeholder="e.g., at my desk"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[#92c0c9] text-sm">If this gets in the way...</span>
                    <input
                      type="text"
                      value={formData.obstacle}
                      onChange={(e) => setFormData({ ...formData, obstacle: e.target.value })}
                      className="input-field w-full mt-1"
                      placeholder="e.g., Not in the mood"
                    />
                  </label>

                  <label className="block">
                    <span className="text-[#92c0c9] text-sm">My backup plan...</span>
                    <input
                      type="text"
                      value={formData.backupPlan}
                      onChange={(e) => setFormData({ ...formData, backupPlan: e.target.value })}
                      className="input-field w-full mt-1"
                      placeholder="e.g., remind myself how much it helps me"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Schedule Section */}
            <div className="border-t border-[#325e67]/50 pt-6">
              <span className="text-white text-base font-medium">How often?</span>
              <div className="mt-3 space-y-2">
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isDaily
                      ? 'border-[#13c8ec] bg-[#13c8ec]/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="schedule"
                    checked={isDaily}
                    onChange={() => setFormData({ ...formData, scheduleFrequency: 'DAILY', scheduleDays: [] })}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      isDaily ? 'border-[#13c8ec]' : 'border-white/40'
                    }`}
                  >
                    {isDaily && <div className="w-2 h-2 rounded-full bg-[#13c8ec]" />}
                  </div>
                  <span className="text-white text-sm">Every day</span>
                </label>
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    !isDaily
                      ? 'border-[#13c8ec] bg-[#13c8ec]/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="schedule"
                    checked={!isDaily}
                    onChange={() => setFormData({ ...formData, scheduleFrequency: 'SPECIFIC_DAYS' })}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      !isDaily ? 'border-[#13c8ec]' : 'border-white/40'
                    }`}
                  >
                    {!isDaily && <div className="w-2 h-2 rounded-full bg-[#13c8ec]" />}
                  </div>
                  <span className="text-white text-sm">Specific days</span>
                </label>
              </div>

              {!isDaily && (
                <div className="flex justify-between gap-1 mt-4">
                  {DAYS.map((day, index) => {
                    const dayIndex = DAY_INDICES[index];
                    const isSelected = formData.scheduleDays.includes(dayIndex);
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleDay(dayIndex)}
                        className={`w-10 h-10 rounded-full font-bold text-sm transition-colors ${
                          isSelected
                            ? 'bg-[#14b8a6] text-white'
                            : 'bg-white/10 text-[#92c0c9] hover:bg-white/20'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Visibility Section */}
            <div className="border-t border-[#325e67]/50 pt-6">
              <span className="text-white text-base font-medium">Who can see this?</span>
              <div className="mt-3 space-y-2">
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.visibility === 'PUBLIC_TO_CLASS'
                      ? 'border-[#13c8ec] bg-[#13c8ec]/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    checked={formData.visibility === 'PUBLIC_TO_CLASS'}
                    onChange={() => setFormData({ ...formData, visibility: 'PUBLIC_TO_CLASS' })}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      formData.visibility === 'PUBLIC_TO_CLASS' ? 'border-[#13c8ec]' : 'border-white/40'
                    }`}
                  >
                    {formData.visibility === 'PUBLIC_TO_CLASS' && (
                      <div className="w-2 h-2 rounded-full bg-[#13c8ec]" />
                    )}
                  </div>
                  <span className="text-white text-sm">My group (teacher + classmates)</span>
                </label>
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.visibility === 'PRIVATE_TO_PEERS'
                      ? 'border-[#13c8ec] bg-[#13c8ec]/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    checked={formData.visibility === 'PRIVATE_TO_PEERS'}
                    onChange={() => setFormData({ ...formData, visibility: 'PRIVATE_TO_PEERS' })}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      formData.visibility === 'PRIVATE_TO_PEERS' ? 'border-[#13c8ec]' : 'border-white/40'
                    }`}
                  >
                    {formData.visibility === 'PRIVATE_TO_PEERS' && (
                      <div className="w-2 h-2 rounded-full bg-[#13c8ec]" />
                    )}
                  </div>
                  <span className="text-white text-sm">Teacher only</span>
                </label>
              </div>
            </div>

            {/* Delete Button */}
            {onDelete && (
              <div className="border-t border-[#325e67]/50 pt-6">
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm"
                >
                  <span className="material-symbols-outlined !text-lg">delete</span>
                  Delete Habit
                </button>
              </div>
            )}
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
                disabled={isSubmitting || !formData.name.trim()}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#13c8ec] text-[#101f22] font-bold hover:bg-[#0ea5c7] transition-colors disabled:opacity-40"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

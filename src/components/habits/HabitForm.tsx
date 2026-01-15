'use client';

import { useState } from 'react';
import { HabitCategory, ScheduleFrequency, HabitVisibility } from '@/types/models';
import { Button } from '@/components/ui/Button';

interface HabitFormProps {
  onClose: () => void;
  onSubmit?: (data: HabitFormData) => void | Promise<void>;
  initialData?: Partial<HabitFormData>;
}

export interface HabitFormData {
  name: string;
  description: string;
  category: HabitCategory;
  scheduleFrequency: ScheduleFrequency;
  scheduleDays: number[];
  visibility: HabitVisibility;
  startDate: string;
}

const CATEGORIES: { value: HabitCategory; label: string }[] = [
  { value: 'Sleep', label: 'Sleep' },
  { value: 'Movement', label: 'Movement' },
  { value: 'Focus & Study', label: 'Focus & Study' },
  { value: 'Mindfulness & Emotion', label: 'Mindfulness & Emotion' },
  { value: 'Social & Connection', label: 'Social & Connection' },
  { value: 'Nutrition & Hydration', label: 'Nutrition & Hydration' },
  { value: 'Digital Hygiene', label: 'Digital Hygiene' },
  { value: 'Other', label: 'Other' },
];

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function HabitForm({ onClose, onSubmit, initialData }: HabitFormProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<HabitFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || 'Other',
    scheduleFrequency: initialData?.scheduleFrequency || 'DAILY',
    scheduleDays: initialData?.scheduleDays || [],
    visibility: initialData?.visibility || 'PUBLIC_TO_CLASS',
    startDate: initialData?.startDate || todayStr,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit?.(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save habit');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-xl bg-[#111f22] border border-[#325e67]/50 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center gap-2 px-6 py-4 border-b border-[#325e67]/50">
          <div>
            <h2 className="text-xl font-bold text-white">
              {initialData ? 'Edit Habit' : 'Create a New Habit'}
            </h2>
            <p className="text-sm text-[#92c0c9]">
              Fill in the details to {initialData ? 'update your' : 'start tracking a new'} habit.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[60vh]">
          <div className="p-6 space-y-6">
            {/* Habit Name */}
            <label className="block">
              <span className="text-white text-base font-medium">Habit Name</span>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field w-full mt-2"
                placeholder="e.g., Drink 8 glasses of water"
                required
              />
            </label>

            {/* Description */}
            <label className="block">
              <span className="text-white text-base font-medium">Description (Optional)</span>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field w-full mt-2 min-h-[80px] resize-none"
                placeholder="Add more details about your habit"
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <label className="block">
                <span className="text-white text-base font-medium">Category</span>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as HabitCategory })}
                  className="input-field w-full mt-2"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* Start Date */}
              <label className="block">
                <span className="text-white text-base font-medium">Start Date</span>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="input-field w-full mt-2"
                />
              </label>
            </div>

            {/* Schedule */}
            <fieldset>
              <legend className="text-white text-base font-medium mb-3">Schedule</legend>
              <div className="grid grid-cols-3 gap-2 rounded-lg bg-[#192f33] p-1">
                {(['DAILY', 'WEEKLY', 'SPECIFIC_DAYS'] as const).map((freq) => (
                  <label key={freq} className="relative">
                    <input
                      type="radio"
                      name="schedule"
                      value={freq}
                      checked={formData.scheduleFrequency === freq}
                      onChange={() => setFormData({ ...formData, scheduleFrequency: freq })}
                      className="sr-only peer"
                    />
                    <div className="cursor-pointer rounded-md text-center py-2 px-3 text-[#92c0c9] peer-checked:bg-[#13c8ec]/20 peer-checked:text-[#13c8ec] font-medium transition-all">
                      {freq === 'DAILY' ? 'Daily' : freq === 'WEEKLY' ? 'Weekly' : 'Specific Days'}
                    </div>
                  </label>
                ))}
              </div>
              
              {formData.scheduleFrequency === 'SPECIFIC_DAYS' && (
                <div className="mt-4 flex justify-between gap-1">
                  {DAYS.map((day, index) => (
                    <label key={index} className="relative">
                      <input
                        type="checkbox"
                        checked={formData.scheduleDays.includes(index)}
                        onChange={() => toggleDay(index)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-10 flex items-center justify-center cursor-pointer rounded-full text-[#92c0c9] peer-checked:bg-[#13c8ec]/20 peer-checked:text-[#13c8ec] font-bold transition-all">
                        {day}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            {/* Visibility */}
            <fieldset>
              <legend className="text-white text-base font-medium mb-3">Visibility</legend>
              <div className="space-y-3">
                {[
                  { value: 'PUBLIC_TO_CLASS', title: 'Public to group', desc: 'Visible to everyone in your group, including teachers.' },
                  { value: 'ANONYMISED_ONLY', title: 'Anonymised only', desc: 'Your progress contributes to group stats anonymously.' },
                  { value: 'PRIVATE_TO_PEERS', title: 'Private to peers', desc: 'Only you and your teacher can see your progress.' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-start gap-4 p-4 rounded-lg bg-[#192f33] border border-transparent has-[:checked]:border-[#13c8ec]/50 has-[:checked]:bg-[#13c8ec]/10 transition-all cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={opt.value}
                      checked={formData.visibility === opt.value}
                      onChange={() => setFormData({ ...formData, visibility: opt.value as HabitVisibility })}
                      className="mt-1 bg-transparent border-[#92c0c9] text-[#13c8ec] focus:ring-[#13c8ec] focus:ring-offset-0"
                    />
                    <div>
                      <p className="font-medium text-white">{opt.title}</p>
                      <p className="text-sm text-[#92c0c9]">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#325e67]/50">
            {error && (
              <p className="text-red-400 text-sm mb-3">{error}</p>
            )}
            <div className="flex flex-col sm:flex-row-reverse gap-3">
              <Button type="submit" variant="primary" fullWidth className="sm:w-auto" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Add Habit'}
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


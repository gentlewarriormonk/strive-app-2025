'use client';

import { useState } from 'react';
import { HabitCategory } from '@/types/models';
import { Button } from '@/components/ui/Button';
import { TODAY } from '@/lib/mockData';

interface ChallengeFormProps {
  onClose: () => void;
  onSubmit?: (data: ChallengeFormData) => void;
}

export interface ChallengeFormData {
  name: string;
  description: string;
  targetCategory: HabitCategory | '';
  targetType: 'COMPLETIONS_PER_WEEK' | 'STREAK_DAYS';
  targetValue: number;
  startDate: string;
  endDate: string;
  rewardXp: number;
  badgeName: string;
}

const CATEGORIES: { value: HabitCategory | ''; label: string }[] = [
  { value: '', label: 'Any category' },
  { value: 'Sleep', label: 'Sleep' },
  { value: 'Movement', label: 'Movement' },
  { value: 'Focus & Study', label: 'Focus & Study' },
  { value: 'Mindfulness & Emotion', label: 'Mindfulness & Emotion' },
  { value: 'Social & Connection', label: 'Social & Connection' },
  { value: 'Nutrition & Hydration', label: 'Nutrition & Hydration' },
  { value: 'Digital Hygiene', label: 'Digital Hygiene' },
];

export function ChallengeForm({ onClose, onSubmit }: ChallengeFormProps) {
  // Use consistent date reference to avoid hydration mismatch
  const todayStr = TODAY.toISOString().split('T')[0];
  const nextWeek = new Date(TODAY.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState<ChallengeFormData>({
    name: '',
    description: '',
    targetCategory: '',
    targetType: 'COMPLETIONS_PER_WEEK',
    targetValue: 5,
    startDate: todayStr,
    endDate: nextWeek,
    rewardXp: 50,
    badgeName: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-hidden rounded-xl bg-[#111f22] border border-[#325e67]/50 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center gap-2 px-6 py-4 border-b border-[#325e67]/50">
          <div>
            <h2 className="text-xl font-bold text-white">Create a Challenge</h2>
            <p className="text-sm text-[#92c0c9]">
              Set up a new challenge for your group.
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
            {/* Challenge Name */}
            <label className="block">
              <span className="text-white text-base font-medium">Challenge Name</span>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field w-full mt-2"
                placeholder="e.g., Mindful Mornings"
                required
              />
            </label>

            {/* Description */}
            <label className="block">
              <span className="text-white text-base font-medium">Description</span>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field w-full mt-2 min-h-[80px] resize-none"
                placeholder="Describe what students need to do to complete this challenge"
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Target Category */}
              <label className="block">
                <span className="text-white text-base font-medium">Category (Optional)</span>
                <select
                  value={formData.targetCategory}
                  onChange={(e) => setFormData({ ...formData, targetCategory: e.target.value as HabitCategory | '' })}
                  className="input-field w-full mt-2"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* Reward XP */}
              <label className="block">
                <span className="text-white text-base font-medium">Reward XP</span>
                <input
                  type="number"
                  value={formData.rewardXp}
                  onChange={(e) => setFormData({ ...formData, rewardXp: parseInt(e.target.value) || 0 })}
                  className="input-field w-full mt-2"
                  min="10"
                  max="500"
                  step="10"
                />
              </label>
            </div>

            {/* Target Type */}
            <fieldset>
              <legend className="text-white text-base font-medium mb-3">Challenge Type</legend>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-start gap-3 p-4 rounded-lg bg-[#192f33] border border-transparent has-[:checked]:border-[#13c8ec]/50 has-[:checked]:bg-[#13c8ec]/10 transition-all cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    value="COMPLETIONS_PER_WEEK"
                    checked={formData.targetType === 'COMPLETIONS_PER_WEEK'}
                    onChange={() => setFormData({ ...formData, targetType: 'COMPLETIONS_PER_WEEK' })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-white">Completions</p>
                    <p className="text-sm text-[#92c0c9]">Complete X times</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 rounded-lg bg-[#192f33] border border-transparent has-[:checked]:border-[#13c8ec]/50 has-[:checked]:bg-[#13c8ec]/10 transition-all cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    value="STREAK_DAYS"
                    checked={formData.targetType === 'STREAK_DAYS'}
                    onChange={() => setFormData({ ...formData, targetType: 'STREAK_DAYS' })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-white">Streak</p>
                    <p className="text-sm text-[#92c0c9]">Build a streak</p>
                  </div>
                </label>
              </div>
            </fieldset>

            {/* Target Value */}
            <label className="block">
              <span className="text-white text-base font-medium">
                Target {formData.targetType === 'STREAK_DAYS' ? 'Days' : 'Completions'}
              </span>
              <input
                type="number"
                value={formData.targetValue}
                onChange={(e) => setFormData({ ...formData, targetValue: parseInt(e.target.value) || 1 })}
                className="input-field w-full mt-2"
                min="1"
                max="30"
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* End Date */}
              <label className="block">
                <span className="text-white text-base font-medium">End Date</span>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="input-field w-full mt-2"
                />
              </label>
            </div>

            {/* Badge Name */}
            <label className="block">
              <span className="text-white text-base font-medium">Badge Name (Optional)</span>
              <input
                type="text"
                value={formData.badgeName}
                onChange={(e) => setFormData({ ...formData, badgeName: e.target.value })}
                className="input-field w-full mt-2"
                placeholder="e.g., Mindful Starter"
              />
            </label>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#325e67]/50">
            <div className="flex flex-col sm:flex-row-reverse gap-3">
              <Button type="submit" variant="primary" fullWidth className="sm:w-auto">
                Create Challenge
              </Button>
              <Button type="button" variant="ghost" onClick={onClose} fullWidth className="sm:w-auto">
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


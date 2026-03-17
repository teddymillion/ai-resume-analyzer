'use client';

import { useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface ScoreCardProps {
  score: number;
  label: string;
  description: string;
  icon: LucideIcon;
}

export default function ScoreCard({ score, label, description, icon: Icon }: ScoreCardProps) {
  const [displayScore, setDisplayScore] = useState(0);

  // Animate score from 0 to final value
  useEffect(() => {
    const duration = 800;
    const startTime = Date.now();

    const animateScore = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayScore(Math.round(progress * score));

      if (progress < 1) {
        requestAnimationFrame(animateScore);
      }
    };

    animateScore();
  }, [score]);

  // Determine color based on score
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-600';
    if (s >= 60) return 'text-blue-600';
    if (s >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (s: number) => {
    if (s >= 80) return 'bg-green-600';
    if (s >= 60) return 'bg-blue-600';
    if (s >= 40) return 'bg-amber-600';
    return 'bg-red-600';
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {/* Circular Progress */}
      <div className="relative w-20 h-20 mb-4">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${(displayScore / 100) * 282.7} 282.7`}
            strokeLinecap="round"
            className={`transition-all duration-300 ${getProgressColor(displayScore)}`}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${getScoreColor(displayScore)}`}>
            {displayScore}
          </span>
        </div>
      </div>

      {/* Label and description */}
      <p className="text-sm font-semibold text-slate-900 mb-1">{label}</p>
      <p className="text-xs text-slate-600">{description}</p>
    </div>
  );
}

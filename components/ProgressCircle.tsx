import React from 'react';

interface ProgressCircleProps {
  score: number;
  label?: string;
}

const ProgressCircle = ({ score, label = 'Match Score' }: ProgressCircleProps) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getStrokeColor = () => {
    if (score >= 75) return 'stroke-green-500';
    if (score >= 50) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };
  
  const getTextColor = () => {
    if (score >= 75) return 'fill-green-400';
    if (score >= 50) return 'fill-yellow-400';
    return 'fill-red-400';
  };

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          className="stroke-slate-700"
          strokeWidth="10"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <circle
          className={`${getStrokeColor()} transition-all duration-1000 ease-out`}
          strokeWidth="10"
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".3em"
          className={`text-3xl font-bold ${getTextColor()}`}
        >
          {`${score}%`}
        </text>
      </svg>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[2em] text-center text-sm font-semibold text-slate-400">
        {label}
      </div>
    </div>
  );
};

export default ProgressCircle;
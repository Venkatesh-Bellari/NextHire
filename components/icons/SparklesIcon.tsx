import React from 'react';

interface IconProps {
  className?: string;
}

const SparklesIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.5 2.5l1.64 3.32L15 7.5l-3.86 1.68L9.5 12.5l-1.64-3.32L4 7.5l3.86-1.68L9.5 2.5zM19.5 14.5l-1.64 3.32L14 19.5l3.86-1.68L19.5 14.5zM14 4l1.09 2.22L17.5 7.5 15.28 8.59 14 11l-1.28-2.41L10.5 7.5l2.22-1.09L14 4z" />
  </svg>
);

export default SparklesIcon;

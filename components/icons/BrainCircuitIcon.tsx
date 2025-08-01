import React from 'react';

interface IconProps {
  className?: string;
}

const BrainCircuitIcon = ({ className }: IconProps) => (
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
    <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5c0 1.25.5 2.4 1.34 3.25" />
    <path d="M12 2a4.5 4.5 0 0 1 4.5 4.5c0 1.25-.5 2.4-1.34 3.25" />
    <path d="M12 15a4.5 4.5 0 0 0-4.5-4.5c-1.25 0-2.4.5-3.25 1.34" />
    <path d="M12 15a4.5 4.5 0 0 1 4.5-4.5c1.25 0 2.4.5 3.25 1.34" />
    <path d="M5 18a4.5 4.5 0 0 0 4.5 4.5c1.25 0 2.4-.5 3.25-1.34" />
    <path d="M19 18a4.5 4.5 0 0 1-4.5 4.5c-1.25 0-2.4-.5-3.25-1.34" />
    <circle cx="12" cy="12" r=".5" fill="currentColor" />
    <path d="M12 12v-2" />
    <path d="M12 12v3" />
    <path d="m14.5 14.5-.88-.88" />
    <path d="M9.5 9.5l-.88-.88" />
    <path d="m14.5 9.5.88-.88" />
    <path d="m9.5 14.5.88-.88" />
  </svg>
);

export default BrainCircuitIcon;

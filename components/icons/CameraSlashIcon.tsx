import React from 'react';

interface IconProps {
  className?: string;
}

const CameraSlashIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.201 10.27L21 7.5v9l-5.799-2.77M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
     <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 3l18 18"
    />
  </svg>
);

export default CameraSlashIcon;
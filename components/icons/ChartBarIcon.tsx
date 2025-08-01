import React from 'react';

interface IconProps {
  className?: string;
}

const ChartBarIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M5,9.2H8V19H5V9.2M10.6,5H13.4V19H10.6V5M16.2,13H19V19H16.2V13Z" />
  </svg>
);

export default ChartBarIcon;

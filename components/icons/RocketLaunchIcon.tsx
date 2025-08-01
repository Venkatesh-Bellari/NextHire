import React from 'react';

interface IconProps {
  className?: string;
}

const RocketLaunchIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a12.022 12.022 0 01-12.022 12.022A12.022 12.022 0 013.568 5.84m12.022 8.532l-2.022-2.022m2.022 2.022l2.25 2.25M13.5 3l-2.25 2.25L9 3m4.5 0l2.25 2.25L18 3m-4.5 0v6.75"
    />
  </svg>
);

export default RocketLaunchIcon;

import React from 'react';

interface SpinnerProps {
    className?: string;
}

const Spinner = ({ className = 'border-white' }: SpinnerProps) => {
  return (
    <div className={`animate-spin rounded-full h-6 w-6 border-b-2 ${className}`}></div>
  );
};

export default Spinner;
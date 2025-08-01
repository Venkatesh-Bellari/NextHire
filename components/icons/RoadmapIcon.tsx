import React from 'react';

interface IconProps {
  className?: string;
}

const RoadmapIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.25,2.75H16.75V2H15.25V2.75H8.75V2H7.25V2.75H5.75C4.78,2.75 4,3.53 4,4.5V21.5C4,22.47 4.78,23.25 5.75,23.25H18.25C19.22,23.25 20,22.47 20,21.5V4.5C20,3.53 19.22,2.75 18.25,2.75M18.25,21.5H5.75V8.25H18.25V21.5M10.63,10.25L9.38,11.5L12.13,14.25L14.88,11.5L13.63,10.25L12.88,11V4H11.38V11L10.63,10.25Z" />
  </svg>
);

export default RoadmapIcon;

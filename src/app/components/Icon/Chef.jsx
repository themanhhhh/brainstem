import React from 'react';

export function ChefHat(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      {...props}
    >
      {/* Thêm vòng tròn để làm viền */}
      

      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={0.5}
        d="M18 13a4 4 0 1 0-2.225-7.325M6 13a4 4 0 1 1 2.225-7.325m7.55 0a4.002 4.002 0 0 0-7.55 0m7.55 0A4 4 0 0 1 15.874 8m-6.41-1a4 4 0 0 0-1.24-1.325M6 17.5c1.599-.622 3.7-1 6-1s4.401.378 6 1M5 21c1.866-.622 4.316-1 7-1s5.134.378 7 1m-1-9v8M6 12v8"
        color="currentColor"
      />
    </svg>
  );
}

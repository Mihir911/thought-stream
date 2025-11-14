import React from 'react';

/**
 * SVG Logo component for BlogSpace
 * - White + Dark Blue theme
 * - Simple pen + wave mark that scales well and is accessible
 */
const Logo = ({ className = 'h-9 w-auto', title = 'BlogSpace' }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 120 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>

      {/* mark */}
      <defs>
        <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#0f172a" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>

      <rect width="120" height="32" rx="6" fill="transparent" />

      {/* pen + wave mark */}
      <g transform="translate(6,4)">
        <path
          d="M4 18c2-1 6-3 12-7 4-2 6-4 8-5 1-1 4-3 6-2 2 1 2 4 1 6-1 2-6 6-12 8-9 3-16 3-19 0z"
          fill="url(#g1)"
          opacity="0.95"
        />
        <path
          d="M22 6c1-1.2 3-1.6 4-1 1.2.6 1 2.2 0 3.2-1 1-3 1.2-4 0"
          stroke="#fff"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(0,0) scale(0.9)"
        />
      </g>

      {/* wordmark */}
      <g transform="translate(44,6)">
        <text x="0" y="14" fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" fontWeight="700" fontSize="14" fill="#0f172a">BlogSpace</text>
        <text x="0" y="28" fontFamily="Inter, ui-sans-serif, system-ui" fontSize="9" fill="#475569">Write. Read. Discover.</text>
      </g>
    </svg>
  );
};

export default Logo;
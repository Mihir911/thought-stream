import React from 'react';

/**
 * SVG Logo component for thoughtStream
 * - Modern, gradient-based design
 * - Wider viewBox to accommodate full text
 */
const Logo = ({ className = 'h-10 w-auto', title = 'thoughtStream' }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 190 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>

      <defs>
        <linearGradient id="logo-gradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#4F46E5" /> {/* Indigo 600 */}
          <stop offset="50%" stopColor="#8B5CF6" /> {/* Violet 500 */}
          <stop offset="100%" stopColor="#06B6D4" /> {/* Cyan 500 */}
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Icon: Abstract Stream/Thought Bubble */}
      <g transform="translate(4, 4)">
        <path
          d="M8 20C8 14 12 8 20 8C26 8 30 12 31 16C31.5 18 32 20 32 22C32 27 27 32 20 32C14 32 8 27 8 20Z"
          fill="url(#logo-gradient)"
          opacity="0.1"
        />
        <path
          d="M12 20C12 16 15 12 20 12C24 12 27 15 27.5 18"
          stroke="url(#logo-gradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M12 20C12 24 15 28 20 28C25 28 28 25 28 22"
          stroke="url(#logo-gradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="20" cy="20" r="3" fill="url(#logo-gradient)" />
      </g>

      {/* Wordmark */}
      <g transform="translate(46, 6)">
        <text
          x="0"
          y="16"
          fontFamily="'Plus Jakarta Sans', Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
          fontWeight="800"
          fontSize="18"
          fill="#0f172a"
          letterSpacing="-0.5"
        >
          thought<tspan fill="url(#logo-gradient)">Stream</tspan>
        </text>
        <text
          x="0"
          y="28"
          fontFamily="Inter, ui-sans-serif, system-ui"
          fontSize="9.5"
          fontWeight="500"
          fill="#64748b"
          letterSpacing="0.5"
        >
          Write. Read. Discover.
        </text>
      </g>
    </svg>
  );
};

export default Logo;
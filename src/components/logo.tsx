/**
 * @fileoverview Logo Component
 * 
 * @description
 * A simple, reusable SVG logo component for the application.
 * The color can be controlled via Tailwind's `text-primary` class.
 */
export function Logo() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <rect
        width="48"
        height="48"
        rx="12"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <path
        d="M14 34V14H18.36L24 23.32L29.64 14H34V34H30V19.88L25.32 28.2H22.68L18 19.88V34H14Z"
        fill="currentColor"
      />
    </svg>
  );
}

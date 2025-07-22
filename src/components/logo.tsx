
/**
 * @fileoverview Logo Component
 * 
 * @description
 * A simple, reusable SVG logo component for the application.
 * The "M" shape is a stylized representation of the brand.
 * The color of the logo is designed to be controlled by the parent component
 * using Tailwind's text color utilities (e.g., `text-primary`), making it
 * adaptable to different backgrounds and themes.
 */
export function Logo() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      // The `className` allows for easy styling with Tailwind CSS.
      className="text-primary"
    >
      {/* The background rectangle with a semi-transparent fill */}
      <rect
        width="48"
        height="48"
        rx="12"
        fill="currentColor"
        fillOpacity="0.2"
      />
      {/* The "M" path, which inherits its fill color from the parent's text color */}
      <path
        d="M14 34V14H18.36L24 23.32L29.64 14H34V34H30V19.88L25.32 28.2H22.68L18 19.88V34H14Z"
        fill="currentColor"
      />
    </svg>
  );
}

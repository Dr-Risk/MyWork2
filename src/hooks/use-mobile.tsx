import * as React from "react"

/**
 * @fileoverview A custom React hook to detect if the user is on a mobile-sized screen.
 * 
 * @description
 * This hook uses the `window.matchMedia` API to determine if the current viewport
 * width is below a defined mobile breakpoint. It's useful for rendering different
 * components or layouts on mobile vs. desktop.
 */

// The viewport width in pixels below which the device is considered "mobile".
const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // State to store whether the screen is mobile-sized. `undefined` initially
  // to prevent hydration mismatches between server and client.
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // `matchMedia` is a browser API, so this effect will only run on the client.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // The function that will be called whenever the screen size crosses the breakpoint.
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Add the event listener.
    mql.addEventListener("change", onChange)
    
    // Set the initial state when the component mounts.
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Cleanup function: remove the event listener when the component unmounts.
    return () => mql.removeEventListener("change", onChange)
  }, []) // The empty dependency array ensures this runs only once on mount.

  return !!isMobile
}

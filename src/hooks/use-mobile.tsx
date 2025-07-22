
import * as React from "react"

/**
 * @fileoverview A custom React hook to detect if the user is on a mobile-sized screen.
 * 
 * @description
 * This hook uses the `window.matchMedia` API to determine if the current viewport
 * width is below a defined mobile breakpoint (768px). It's a client-side hook,
 * as it relies on browser-specific APIs. It returns `true` if the screen is
 * considered mobile, and `false` otherwise.
 */

// The viewport width in pixels below which the device is considered "mobile".
const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // State to store whether the screen is mobile-sized. It's initialized to
  // `undefined` to handle Server-Side Rendering (SSR) correctly and prevent
  // hydration mismatches between the server-rendered HTML and the initial
  // client-side render.
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // `matchMedia` is a browser-only API, so this effect will only run on the client.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // This function will be called whenever the screen size crosses the breakpoint.
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Add the event listener to respond to changes in viewport size.
    mql.addEventListener("change", onChange)
    
    // Set the initial state when the component first mounts on the client.
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // The cleanup function: remove the event listener when the component unmounts
    // to prevent memory leaks.
    return () => mql.removeEventListener("change", onChange)
  }, []) // The empty dependency array `[]` ensures this effect runs only once on mount.

  // The `!!` converts the `undefined` initial state to `false` on the server
  // and during the first render on the client, providing a safe default.
  return !!isMobile
}

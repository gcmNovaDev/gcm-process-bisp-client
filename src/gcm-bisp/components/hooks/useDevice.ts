'use client'
import { useEffect, useState } from "react"

export const useDevice = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    setIsMobile(media.matches)
    setIsReady(true)

    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    media.addEventListener("change", handleChange)
    return () => media.removeEventListener("change", handleChange)
  }, [breakpoint])

  return { isMobile, isReady }
}
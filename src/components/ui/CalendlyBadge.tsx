'use client'

import Script from 'next/script'
import { useEffect } from 'react'

/**
 * Calendly badge widget — bottom-right floating "Schedule time with me".
 * Uses the official Calendly widget.js + widget.css. The badge initializer
 * must run AFTER widget.js has loaded, so we kick it off in Script's onReady
 * and also keep a small useEffect fallback in case the script was cached
 * and `onReady` did not fire.
 */
declare global {
  interface Window {
    Calendly?: {
      initBadgeWidget: (opts: {
        url: string
        text: string
        color: string
        textColor: string
        branding: boolean
      }) => void
    }
  }
}

const CONFIG = {
  url: 'https://calendly.com/zawda',
  text: 'Schedule time with me',
  color: '#d69828',
  textColor: '#ffffff',
  branding: true,
}

function init() {
  if (typeof window === 'undefined') return
  if (!window.Calendly?.initBadgeWidget) return
  window.Calendly.initBadgeWidget(CONFIG)
}

export function CalendlyBadge() {
  // Fallback init: if the script was already present (client-side nav,
  // cached load), onReady may not run. Attempt init on mount once.
  useEffect(() => {
    init()
  }, [])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://assets.calendly.com/assets/external/widget.css"
      />
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
        onReady={init}
      />
    </>
  )
}

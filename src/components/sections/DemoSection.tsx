'use client'

import { useState, useRef } from 'react'
import { BrandName } from '@/components/ui/BrandName'
import { LinkButton } from '@/components/ui/Button'

const VIDEO_URL = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL ?? ''

export function DemoSection() {
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  function handlePlay() {
    if (VIDEO_URL && videoRef.current) {
      videoRef.current.play()
      setPlaying(true)
    }
  }

  return (
    <section id="demo" className="py-20 sm:py-28 bg-bg-surface" aria-labelledby="demo-heading">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-4">
            See It In Action
          </p>
          <h2 id="demo-heading" className="font-display font-bold text-text tracking-tight" style={{ fontSize: 'var(--text-xl)' }}>
            Your compliance dashboard — before you commit.
          </h2>
          <p className="text-text-muted text-[length:var(--text-sm)] mt-4 leading-relaxed">
            See how <BrandName className="text-gold font-semibold" /> tracks licensing progress, surfaces hidden risks, and keeps your documents audit-ready — all in one place.
          </p>
        </div>

        {/* Video player */}
        <div className="relative rounded-2xl border-2 border-border bg-bg-primary overflow-hidden shadow-lg">
          <div className="relative" style={{ paddingBottom: '56.25%' }}>
            {VIDEO_URL ? (
              <>
                <video
                  ref={videoRef}
                  src={VIDEO_URL}
                  controls={playing}
                  className="absolute inset-0 w-full h-full object-cover"
                  onEnded={() => setPlaying(false)}
                />
                {!playing && (
                  <button
                    onClick={handlePlay}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 cursor-pointer transition-opacity hover:bg-black/20"
                    aria-label="Play demo video"
                  >
                    <div className="w-20 h-20 rounded-full bg-gold flex items-center justify-center shadow-lg mb-4 hover:scale-105 transition-transform">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="white" className="ml-1">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </div>
                    <p className="font-display font-bold text-white text-[length:var(--text-base)]">
                      Watch the dashboard walkthrough
                    </p>
                    <p className="text-white/70 text-[length:var(--text-xs)] mt-1">Under 1 minute</p>
                  </button>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-bg-primary to-bg-surface">
                <div className="w-20 h-20 rounded-full bg-gold flex items-center justify-center shadow-lg mb-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="white" className="ml-1">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
                <p className="font-display font-bold text-text text-[length:var(--text-base)]">
                  Dashboard demo coming soon
                </p>
                <p className="text-text-muted text-[length:var(--text-xs)] mt-2">
                  Licensing roadmap &#183; Document vault &#183; Risk advisory &#183; Compliance alerts
                </p>
              </div>
            )}
          </div>

          {/* Dashboard preview mockup strip */}
          <div className="border-t border-border bg-bg-primary px-6 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-bg-surface rounded-xl p-3">
                <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Licensing</p>
                <p className="font-mono text-gold font-bold text-[length:var(--text-base)] mt-1">0/12</p>
                <div className="mt-2 h-1 bg-bg-surface-2 rounded-full"><div className="h-full bg-gold rounded-full w-0" /></div>
              </div>
              <div className="bg-bg-surface rounded-xl p-3">
                <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Documents</p>
                <p className="font-mono text-gold font-bold text-[length:var(--text-base)] mt-1">0/16</p>
                <div className="mt-2 h-1 bg-bg-surface-2 rounded-full"><div className="h-full bg-gold rounded-full w-0" /></div>
              </div>
              <div className="bg-bg-surface rounded-xl p-3">
                <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Risks</p>
                <p className="font-mono text-alert font-bold text-[length:var(--text-base)] mt-1">6</p>
                <div className="mt-2 h-1 bg-bg-surface-2 rounded-full"><div className="h-full bg-alert rounded-full w-full" /></div>
              </div>
              <div className="bg-bg-surface rounded-xl p-3">
                <p className="font-mono text-text-faint text-[length:var(--text-xs)] uppercase">Alerts</p>
                <p className="font-mono text-red-600 font-bold text-[length:var(--text-base)] mt-1">2 critical</p>
                <div className="mt-2 h-1 bg-bg-surface-2 rounded-full"><div className="h-full bg-red-500 rounded-full w-1/4" /></div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA below video */}
        <div className="text-center mt-10">
          <LinkButton href="/register" variant="primary" className="text-[length:var(--text-sm)]">
            Try the Dashboard Free &#8594;
          </LinkButton>
          <p className="text-text-faint text-[length:var(--text-xs)] mt-3">
            No credit card required. Set up in 2 minutes.
          </p>
        </div>
      </div>
    </section>
  )
}

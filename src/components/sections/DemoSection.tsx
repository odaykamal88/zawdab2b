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
              <div className="absolute inset-0 flex flex-col bg-bg-primary overflow-hidden">
                {/* Mock sidebar */}
                <div className="flex flex-1 overflow-hidden">
                  <div className="hidden sm:flex flex-col w-44 bg-bg-dark border-r border-white/10 p-4 gap-3 shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded bg-gold/20 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-sm bg-gold" />
                      </div>
                      <div className="h-3 w-16 rounded bg-white/10" />
                    </div>
                    {['Dashboard', 'Licensing', 'Documents', 'Risk Map', 'Alerts'].map((item, i) => (
                      <div key={item} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${i === 0 ? 'bg-gold/10' : ''}`}>
                        <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-gold' : 'bg-white/20'}`} />
                        <span className={`text-[10px] font-mono uppercase tracking-wider ${i === 0 ? 'text-gold' : 'text-white/40'}`}>{item}</span>
                      </div>
                    ))}
                  </div>
                  {/* Mock main content */}
                  <div className="flex-1 p-4 sm:p-6 bg-bg-surface overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="h-4 w-32 rounded bg-border mb-1.5" />
                        <div className="h-2.5 w-48 rounded bg-border/60" />
                      </div>
                      <div className="h-8 w-28 rounded-lg bg-gold/20 border border-gold/30" />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {[
                        { label: 'VARA Status', value: 'In Review', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
                        { label: 'Risk Score', value: '68 / 100', color: 'text-alert', bg: 'bg-red-50 border-red-200' },
                        { label: 'Docs Ready', value: '11 / 16', color: 'text-gold', bg: 'bg-gold-light border-gold/20' },
                        { label: 'Days to Deadline', value: '47', color: 'text-text', bg: 'bg-bg-primary border-border' },
                      ].map((card) => (
                        <div key={card.label} className={`rounded-xl p-3 border ${card.bg}`}>
                          <p className="font-mono text-text-faint text-[9px] uppercase tracking-wider mb-1">{card.label}</p>
                          <p className={`font-mono font-bold text-[length:var(--text-sm)] ${card.color}`}>{card.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl border border-border bg-bg-primary p-3">
                      <div className="h-2.5 w-24 rounded bg-border mb-3" />
                      <div className="space-y-2">
                        {[80, 55, 35, 90, 60].map((w, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-gold/40 shrink-0" />
                            <div className="h-2 rounded-full bg-border" style={{ width: `${w}%` }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Overlay CTA */}
                <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/60 backdrop-blur-[2px]">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gold flex items-center justify-center shadow-lg mb-4 mx-auto hover:scale-105 transition-transform">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="ml-1" aria-hidden="true">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </div>
                    <p className="font-display font-bold text-text text-[length:var(--text-base)]">Dashboard preview</p>
                    <p className="text-text-muted text-[length:var(--text-xs)] mt-1">Full walkthrough video coming soon</p>
                  </div>
                </div>
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

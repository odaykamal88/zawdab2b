'use client'

import { useState } from 'react'
import { BrandName } from '@/components/ui/BrandName'
import { BrandMark } from '@/components/ui/BrandMark'


const NAV_LINKS = [
  { label: 'Assessment', href: '#assessment' },
  { label: 'Services', href: '#product' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Brief', href: '#brief' },
]

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-xl bg-bg-primary/90 border-b border-border"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2.5" aria-label="Home">
            <BrandMark size={34} className="text-gold shrink-0" />
            <BrandName className="font-display text-lg font-bold tracking-[0.08em] text-text uppercase" />
          </a>

          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-text-muted hover:text-text text-[length:var(--text-sm)] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a href="/login" className="text-text-muted hover:text-text text-[length:var(--text-sm)] transition-colors">
              Sign In
            </a>
            <a href="/register" className="inline-flex items-center justify-center px-6 py-2 rounded-xl bg-gold text-white text-[length:var(--text-sm)] font-medium hover:brightness-110 transition-all">
              Request Access
            </a>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-text-muted hover:text-text"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                className="block text-text-muted hover:text-text text-[length:var(--text-base)] py-1">
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-border space-y-3">
              <a href="/login" onClick={() => setMenuOpen(false)}
                className="block text-text-muted hover:text-text text-[length:var(--text-base)] py-1">
                Sign In
              </a>
              <a href="/register" onClick={() => setMenuOpen(false)}
                className="block w-full text-center px-6 py-2.5 rounded-xl bg-gold text-white text-[length:var(--text-sm)] font-medium hover:brightness-110 transition-all">
                Request Access
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

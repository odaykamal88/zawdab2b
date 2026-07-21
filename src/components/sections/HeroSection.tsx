'use client'

import { useEffect, useState } from 'react'
import { BrandName } from '@/components/ui/BrandName'
import { ComplianceAssessment } from '@/components/assessment/ComplianceAssessment'
import { Button } from '@/components/ui/Button'
import { getWeeklyTopRisk, type TopRisk } from '@/lib/top-risks'

export function HeroSection() {
  const [showAssessment, setShowAssessment] = useState(false)
  // Resolve the week's risk on the client to avoid hydration drift if the
  // server and viewer are in different ISO weeks around midnight UTC.
  const [weeklyRisk, setWeeklyRisk] = useState<TopRisk | null>(null)
  useEffect(() => {
    setWeeklyRisk(getWeeklyTopRisk())
  }, [])

  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-16 sm:pt-24 pb-12"
      aria-labelledby="hero-heading"
    >
      {/* Brand diamond-pattern backdrop — low opacity so content reads cleanly */}
      <div
        className="absolute inset-0 bg-zawda-pattern opacity-[0.04] pointer-events-none"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bg-primary to-transparent pointer-events-none" aria-hidden="true" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered headline */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <p className="font-mono text-gold uppercase tracking-widest text-[length:var(--text-xs)] mb-4">
            MENA Regulatory Intelligence
          </p>
          <h1
            id="hero-heading"
            className="font-display font-extrabold tracking-tight text-text"
            style={{ fontSize: 'var(--text-2xl)' }}
          >
            MENA Regulators Issued $12M+ in Fines Last Year. Is Your Firm Ready?
          </h1>
          <p className="text-text-muted mt-4 max-w-2xl mx-auto" style={{ fontSize: 'var(--text-lg)' }}>
            <BrandName className="text-gold font-semibold" /> gives CFOs, compliance officers, and legal counsel
            the regulatory intelligence to stay ahead of enforcement across Dubai, Abu Dhabi, Bahrain, and beyond.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 mb-2">
          <Button
            variant="primary"
            onClick={() => setShowAssessment(true)}
            className="text-[length:var(--text-base)] px-8 py-3"
          >
            Start Free Assessment &#8594;
          </Button>
          <a href="/register" className="text-text-muted text-[length:var(--text-sm)] hover:text-text transition-colors">
            or request dashboard access
          </a>
        </div>

        {/* Assessment area */}
        <div id="assessment" className="mt-10">
          {showAssessment ? (
            <ComplianceAssessment />
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="bg-bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-sm text-center">
                <p className="font-mono text-gold text-[length:var(--text-xs)] uppercase tracking-widest mb-3">
                  Free Compliance Assessment
                </p>
                <h3 className="font-display font-bold text-text text-[length:var(--text-lg)] mb-2">
                  How exposed is your firm?
                </h3>
                <p className="text-text-muted text-[length:var(--text-sm)] leading-relaxed max-w-lg mx-auto mb-6">
                  Answer 5 quick questions about your licensing, jurisdiction, and compliance posture.
                  Get a personalized risk score with actionable next steps — takes under 2 minutes.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowAssessment(true)}
                  className="text-[length:var(--text-sm)]"
                >
                  Start Assessment &#8594;
                </Button>
                <p className="text-text-faint text-[length:var(--text-xs)] mt-3">
                  No sign-up required. Your answers are not stored.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Trust metrics — last slot rotates weekly to the top regulatory risk */}
        <div className="flex flex-wrap justify-center gap-10 mt-12 pt-8 border-t border-border">
          {[
            { value: 'Daily', label: 'regulator monitoring' },
            { value: '8+', label: 'jurisdictions covered' },
            { value: 'AED 600K', label: 'max penalty per violation' },
            weeklyRisk
              ? { value: weeklyRisk.stat, label: weeklyRisk.statLabel }
              : { value: '—', label: 'this week\u2019s top risk' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <span className="font-mono text-gold font-bold text-[length:var(--text-xl)]">
                {stat.value}
              </span>
              <p className="text-text-muted text-[length:var(--text-sm)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

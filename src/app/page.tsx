import { FloatingAlert } from '@/components/ui/FloatingAlert'
import { CalendlyBadge } from '@/components/ui/CalendlyBadge'
import { Navbar } from '@/components/nav/Navbar'
import { HeroSection } from '@/components/sections/HeroSection'
import { QuotesSection } from '@/components/sections/QuotesSection'
import { PainSection } from '@/components/sections/PainSection'
import { DemoSection } from '@/components/sections/DemoSection'
import { RegulatoryMapSection } from '@/components/sections/RegulatoryMapSection'
import { PricingSection } from '@/components/sections/PricingSection'
import { BriefSection } from '@/components/sections/BriefSection'
import { FooterSection } from '@/components/sections/FooterSection'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero with inline assessment */}
        <HeroSection />
        {/* Industry quotes / social proof */}
        <QuotesSection />
        {/* Pain — enforcement stats */}
        <PainSection />
        {/* Dashboard video demo */}
        <DemoSection />
        {/* Regulatory map — interactive expandable table */}
        <RegulatoryMapSection />
        {/* Pricing with annual toggle */}
        <PricingSection />
        {/* Weekly brief CTA + subscribe form */}
        <BriefSection />
      </main>
      <FooterSection />
      <FloatingAlert />
      <CalendlyBadge />
    </>
  )
}

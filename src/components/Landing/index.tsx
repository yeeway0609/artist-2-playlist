import FAQ from './FAQ'
import Features from './Features'
import Hero from './Hero'
import HowItWorks from './HowItWorks'

export default function Landing() {
  return (
    <div className="flex w-full flex-col items-center gap-16 py-16">
      <Hero />
      <Features />
      <HowItWorks />
      <FAQ />
    </div>
  )
}

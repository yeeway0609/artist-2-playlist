import Link from 'next/link'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import SignInButton from './SignInButton'

const faqs = [
  {
    question: 'Why do I need to sign in with Spotify?',
    answer:
      'Creating and editing playlists in your library requires your permission. Signing in grants this app a scoped token through Spotify’s official OAuth flow — we never see your password.',
  },
  {
    question: 'What permissions does the app use?',
    answer:
      'Only what the features need: reading your playlists, and creating or modifying playlists on your behalf. Nothing else.',
  },
  {
    question: 'Do you store my data?',
    answer: 'No. There is no database — everything runs in your browser and talks directly to the Spotify API.',
    link: { href: '/privacy-policy', label: 'Read the Privacy Policy' },
  },
  {
    question: 'Can I edit a playlist without adding songs?',
    answer:
      'Yes. The “Organize a playlist” section lets you reorder or remove songs in any of your playlists and save when you’re happy with the result.',
  },
]

export default function FAQ() {
  return (
    <section className="w-full">
      <h2 className="page-title">FAQ</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq) => (
          <AccordionItem value={faq.question} key={faq.question}>
            <AccordionTrigger className="text-left text-sm">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              {faq.answer}
              {faq.link && (
                <>
                  {' '}
                  <Link className="text-link" href={faq.link.href}>
                    {faq.link.label}
                  </Link>
                </>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-10 flex justify-center">
        <SignInButton />
      </div>
    </section>
  )
}

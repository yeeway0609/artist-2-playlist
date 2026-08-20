import Link from 'next/link'

const steps = [
  {
    title: 'Sign in & pick an artist',
    description: 'Connect your Spotify account, search for any artist, and choose which album types to include.',
  },
  {
    title: 'Preview & organize',
    description:
      'All songs load into the organizer — sort by release date, drag to reorder, and exclude the versions you don’t want.',
  },
  {
    title: 'Save to Spotify',
    description: 'Create a new playlist or add only the missing songs to an existing one. Done.',
  },
]

export default function HowItWorks() {
  return (
    <section className="w-full">
      <h2 className="page-title">How it works</h2>
      <ol className="flex flex-col gap-6">
        {steps.map((step, index) => (
          <li className="flex gap-4" key={step.title}>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
              {index + 1}
            </span>
            <div>
              <h3 className="font-medium">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-center text-sm">
        <Link className="text-link" href="/how-to-use">
          Watch the full walkthrough
        </Link>
      </p>
    </section>
  )
}

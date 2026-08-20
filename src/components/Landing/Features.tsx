import { CalendarArrowUp, LibraryBig, ListChecks, ListPlus } from 'lucide-react'

const features = [
  {
    icon: ListPlus,
    title: 'Every song, one click',
    description: "Pick an artist and get their entire discography into a playlist — no more adding albums one by one.",
  },
  {
    icon: LibraryBig,
    title: 'Filter album types',
    description: 'Choose which release types to include: albums, singles, appearances, or compilations.',
  },
  {
    icon: CalendarArrowUp,
    title: 'Sort by release date',
    description: "Order songs from oldest to latest (or the other way) — something Spotify's own UI can't do.",
  },
  {
    icon: ListChecks,
    title: 'Preview & organize',
    description:
      'Reorder by dragging, drop duplicate titles and instrumentals, and nothing is saved until you confirm.',
  },
]

export default function Features() {
  return (
    <section className="w-full">
      <h2 className="page-title">What you can do</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {features.map(({ icon: Icon, title, description }) => (
          <div className="rounded-lg border p-4" key={title}>
            <Icon className="size-5 text-primary" />
            <h3 className="mt-2 font-medium">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

import Link from 'next/link'
import ArrowUpRightIcon from '@/components/ui/arrow-up-right'

export default function Footer() {
  return (
    <div className="mt-auto flex w-full justify-center border-t border-border">
      <footer className="flex w-full max-w-screen-sm flex-col p-6">
        <div className="flex justify-center gap-5 text-sm">
          <Link href="/privacy-policy">Privacy policy</Link>
          <Link href="https://forms.gle/wgGBjkw9CL7ahypK7" target="_blank">
            <span className="mr-1">Feedback form</span>
            <ArrowUpRightIcon />
          </Link>
          <Link href="https://github.com/yeeway0609/artist-2-playlist" target="_blank">
            <span className="mr-1">GitHub</span>
            <ArrowUpRightIcon />
          </Link>
        </div>
        <p className="mt-2 text-center text-sm text-primary">
          Built by{' '}
          <Link className="text-link" href="mailto:hi@yeeway.dev" target="_blank">
            yeeway
          </Link>{' '}
          © 2025
        </p>
      </footer>
    </div>
  )
}

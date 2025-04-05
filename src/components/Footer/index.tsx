import Link from 'next/link'
import ArrowUpRightIcon from '@/components/ui/arrow-up-right'

const GITHUB_URL = 'https://github.com/yeeway0609/artist-2-playlist'
const CONTACT_URL = 'mailto:yiwei.suuu@gmail.com'

export default function Footer() {
  return (
    <div className="mt-auto flex w-full justify-center border-t border-border">
      <footer className="flex w-full max-w-screen-sm flex-col space-y-1 p-6">
        <div className="flex justify-center gap-5 text-sm">
          <Link href="/privacy-policy">Privacy policy</Link>
          <Link href={GITHUB_URL} target="_blank">
            <span className="mr-1">GitHub</span>
            <ArrowUpRightIcon />
          </Link>
          <Link href={CONTACT_URL} target="_blank">
            <span className="mr-1">Contact me</span>
            <ArrowUpRightIcon />
          </Link>
        </div>
        <p className="pt-1 text-center text-sm text-primary">
          Built by{' '}
          <Link className="text-link" href="https://github.com/yeeway0609" target="_blank">
            yeeway
          </Link>{' '}
          © 2025
        </p>
      </footer>
    </div>
  )
}

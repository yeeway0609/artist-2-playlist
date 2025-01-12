import Link from 'next/link'
import ArrowUpRightIcon from '@/components/ui/arrow-up-right'

const GITHUB_URL = 'https://github.com/yeeway0609/artist-2-playlist'
const REPORT_ISSUE_URL = ''

export default function Footer() {
  return (
    <footer className="flex flex-col space-y-1 border-t border-border px-6 py-8">
      <Link href="/privacy-policy">Privacy policy</Link>
      <Link href={GITHUB_URL} target="_blank">
        <span className="mr-1">GitHub</span>
        <ArrowUpRightIcon />
      </Link>
      <Link href={REPORT_ISSUE_URL} target="_blank">
        <span className="mr-1">Report a issue</span>
        <ArrowUpRightIcon />
      </Link>
      <p className="pt-1 text-center text-sm text-primary">Copyright © 2025 yeeway</p>
    </footer>
  )
}

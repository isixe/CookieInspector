/* eslint-disable @next/next/no-img-element */
import { Button } from '@/components/ui/button'
import { FileText, Globe, Mail } from 'lucide-react'
import { GithubIcon } from '../icons/github-icon'

export default function CookieAbout() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col">
      {/* Header with logo and title */}
      <div className="flex items-center gap-4 border-b pb-4">
        <div className="h-50 w-50 flex items-center justify-center rounded-full sm:h-20 sm:w-20">
          <img
            src="/favicon.ico"
            alt="Logo"
            className="max-h-full max-w-full"
          />
        </div>
        <div>
          <h2 className="text-xl font-bold">Cookie Inspector Tool</h2>
          <p className="mt-1 text-muted-foreground">
            An open source tool for inspecting, parsing, and managing browser
            cookies which stored entirely locally.
          </p>
          <div className="mt-2">
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
              v1.0.0
            </span>
          </div>
        </div>
      </div>

      {/* Links section */}
      <div className="space-y-4 py-4">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Official Website</span>
          </div>
          <Button variant="outline" size="sm">
            <a
              href="https://cookie-inspector.itea.dev/"
              target="_blank"
              rel="noopener noreferrer"
            >
              View
            </a>
          </Button>
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <GithubIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Feedback</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://github.com/isixe/CookieInspector/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              Feedback
            </a>
          </Button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>License</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://github.com/isixe/CookieInspector/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
            >
              View
            </a>
          </Button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Email Contact</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="mailto:isixe@outlook.com">Email</a>
          </Button>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isIos() {
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && navigator.maxTouchPoints > 1)
}

export function InstallButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(() => isStandalone())
  const [showIosHelp, setShowIosHelp] = useState(false)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed) return null
  const ios = isIos()
  if (!deferred && !ios) return null

  const handleClick = async () => {
    if (deferred) {
      await deferred.prompt()
      await deferred.userChoice
      setDeferred(null)
    } else {
      setShowIosHelp((v) => !v)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        className="rounded-md border border-neon/60 bg-neon/10 px-2.5 py-1.5 font-mono text-xs font-medium text-neon transition hover:bg-neon/20"
      >
        Install app
      </button>
      {showIosHelp && (
        <div
          role="dialog"
          className="absolute right-0 top-full z-40 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-3 text-left text-xs text-slate-700 shadow-lg dark:border-border dark:bg-panel dark:text-slate-300"
        >
          <p className="font-semibold">Install on iPhone / iPad</p>
          <ol className="mt-1.5 list-inside list-decimal space-y-1">
            <li>Open this page in Safari</li>
            <li>Tap the Share button</li>
            <li>Choose “Add to Home Screen”</li>
          </ol>
        </div>
      )}
    </div>
  )
}

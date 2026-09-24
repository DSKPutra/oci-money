export function LoadingBox({ label = 'Loading data…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-12 text-sm text-slate-500 dark:border-border dark:bg-panel dark:text-slate-400">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-neon dark:border-border dark:border-t-neon" />
      {label}
    </div>
  )
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 px-4 py-3 text-sm text-rose-500">
      {message}
    </div>
  )
}

export function EmptyBox({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500 dark:border-border dark:text-slate-400">
      {message}
    </div>
  )
}

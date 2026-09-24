import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description: string
  children?: ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="border-b border-slate-200 px-4 py-8 dark:border-border sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">{description}</p>
        {children}
      </div>
    </div>
  )
}

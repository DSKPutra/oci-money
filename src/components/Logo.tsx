export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 48"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="OCI.money"
    >
      <text
        x="0"
        y="34"
        fontFamily="Inter, sans-serif"
        fontWeight="800"
        fontSize="32"
        fill="currentColor"
        className="text-slate-900 dark:text-white"
      >
        OCI
      </text>
      <text x="68" y="34" fontFamily="Inter, sans-serif" fontWeight="500" fontSize="32" fill="#00E599">
        .money
      </text>
    </svg>
  )
}

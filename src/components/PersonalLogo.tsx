interface PersonalMarkProps {
  className?: string
}

export function PersonalMark({ className = '' }: PersonalMarkProps) {
  return (
    <svg
      viewBox="340 290 590 720"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Dea Saka Kurnia Putra logo"
    >
      <defs>
        <filter id="dskp-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <linearGradient id="dskp-black" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0b0d0c" />
          <stop offset="1" stopColor="#020403" />
        </linearGradient>
      </defs>
      <path
        d="M367 316H680C805 316 897 425 897 545C897 668 800 774 680 774H553V698C553 668 575 652 610 650H680C735 640 775 600 775 540C775 480 735 435 685 428H465Z"
        fill="url(#dskp-black)"
      />
      <path
        d="M385 553H755L650 640C600 650 560 665 545 700L510 725V977H385Z"
        fill="url(#dskp-black)"
      />
      <path
        d="M385 832L515 700C535 670 570 655 650 640C730 625 790 580 775 520C765 470 730 440 690 430"
        fill="none"
        stroke="#1fff3a"
        strokeWidth="26"
        strokeLinecap="round"
        filter="url(#dskp-glow)"
        opacity="0.85"
      />
      <path
        d="M385 832L515 700C535 670 570 655 650 640C730 625 790 580 775 520C765 470 730 440 690 430"
        fill="none"
        stroke="#7dff8f"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function PersonalLockup({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <PersonalMark className="h-14 w-auto shrink-0" />
      <div className="text-left">
        <p className="font-sans text-sm font-semibold uppercase tracking-[0.22em] text-slate-900">
          Dea Saka
          <br />
          Kurnia Putra
        </p>
        <p className="mt-1.5 font-sans text-[9px] uppercase tracking-[0.18em] text-slate-500">
          A brighter tomorrow through meaningful work
        </p>
      </div>
    </div>
  )
}

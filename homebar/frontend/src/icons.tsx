import type { SVGProps } from 'react'

// A handful of line icons, drawn on a 24×24 grid and coloured by currentColor.
type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Icon({ size = 18, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  )
}

export function HeartIcon({ filled, ...props }: IconProps & { filled?: boolean }) {
  return (
    <Icon {...props}>
      <path
        d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"
        fill={filled ? 'currentColor' : 'none'}
      />
    </Icon>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </Icon>
  )
}

export function DiceIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="4" width="16" height="16" rx="3.5" />
      <circle cx="9" cy="9" r="0.9" fill="currentColor" />
      <circle cx="15" cy="15" r="0.9" fill="currentColor" />
      <circle cx="15" cy="9" r="0.9" fill="currentColor" />
      <circle cx="9" cy="15" r="0.9" fill="currentColor" />
    </Icon>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  )
}

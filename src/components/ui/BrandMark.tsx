/**
 * Zawda brand mark — the four-diamond glyph from the official 2025 identity.
 * Uses currentColor so callers control hue via `text-gold`, `text-white`, etc.
 * Source: public/brand/zawda-logo-2025.svg (diamond cluster only, wordmark excluded).
 */
export function BrandMark({
  size = 28,
  className,
  title = 'Zawda',
}: {
  size?: number
  className?: string
  title?: string
}) {
  const h = Math.round(size * (41 / 104))
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 104 41"
      fill="none"
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <path d="M97.58 9.18L71.67 35.14l5.72 5.73 25.91-25.96-5.72-5.73Z" fill="currentColor" />
      <path d="M64.33 22.22L53.06 10.91l-5.73 5.74 5.57 5.57-7.18 7.2 5.73 5.72 12.89-12.91Z" fill="currentColor" />
      <path d="M87.93 0L80.65 7.30l7.28 7.29 7.28-7.29L87.93 0Z" fill="currentColor" />
      <path
        d="M79.95 10.91L74.52 5.48 63.38 16.64l5.43 5.44-13.05 13.07 5.72 5.73 24.19-24.24-5.72-5.73Zm-5.43 8.39l-2.64-2.65 2.64-2.65 2.64 2.65-2.64 2.65Z"
        fill="currentColor"
      />
      <path
        d="M37.46 11.06L26.31 22.23l11.14 11.16 11.14-11.16L37.46 11.06Zm0 13.81l-2.64-2.65 2.64-2.65 2.64 2.65-2.64 2.65Z"
        fill="currentColor"
      />
    </svg>
  )
}

/**
 * Full lockup (mark + "ZAWDA" wordmark) from the official SVG.
 * Use where the brand stands alone: login, onboarding hero, auth shells.
 */
export function BrandLockup({
  width = 144,
  className,
}: {
  width?: number
  className?: string
}) {
  const h = Math.round(width * (84 / 129))
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/zawda-logo-2025.svg"
      alt="Zawda"
      width={width}
      height={h}
      className={className}
    />
  )
}

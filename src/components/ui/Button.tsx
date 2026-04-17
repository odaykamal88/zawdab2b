import { type ButtonHTMLAttributes, type AnchorHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost' | 'outline' | 'dark'

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-gold text-white font-semibold hover:brightness-110',
  ghost:
    'border border-border text-text hover:border-text-muted hover:bg-bg-surface',
  outline:
    'border border-gold text-gold hover:bg-gold hover:text-white',
  dark:
    'bg-bg-dark text-white font-semibold hover:bg-[#1a2236]',
}

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-50 disabled:pointer-events-none cursor-pointer'

type ButtonProps = {
  variant?: Variant
} & ButtonHTMLAttributes<HTMLButtonElement>

type LinkButtonProps = {
  variant?: Variant
  href: string
} & AnchorHTMLAttributes<HTMLAnchorElement>

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    />
  )
}

export function LinkButton({ variant = 'primary', className = '', href, ...props }: LinkButtonProps) {
  return (
    <a
      href={href}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    />
  )
}

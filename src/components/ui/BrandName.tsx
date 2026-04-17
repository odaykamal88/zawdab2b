import { BRAND_NAME } from '@/lib/brand'

export function BrandName({ className }: { className?: string }) {
  return <span className={className}>{BRAND_NAME}</span>
}

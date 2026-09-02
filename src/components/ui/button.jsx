import { forwardRef } from 'react'
import { Slot } from 'radix-ui'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils.js'
import { Icon } from '../icons.jsx'

const button = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap select-none',
    'rounded-sm font-medium transition-[background-color,color,border-color,box-shadow,transform] duration-150 ease-out-soft',
    'disabled:opacity-50 disabled:pointer-events-none',
    'active:translate-y-px',
    '[&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-accent text-on-accent shadow-card hover:bg-accent-hover',
        secondary: 'bg-surface text-ink border border-line-strong hover:bg-surface-2 hover:border-ink-3',
        ghost: 'text-ink-2 hover:bg-surface-3 hover:text-ink',
        soft: 'bg-accent-soft text-accent-ink hover:bg-accent hover:text-on-accent',
        destructive: 'bg-negative text-white hover:brightness-95 shadow-card',
        destructiveGhost: 'text-ink-3 hover:text-negative hover:bg-negative-soft',
        success: 'bg-positive text-white hover:brightness-95 shadow-card',
        link: 'text-accent-ink underline-offset-4 hover:underline h-auto px-0',
      },
      size: {
        sm: 'h-8 px-3 text-[13px]',
        md: 'h-9 px-3.5 text-[14px]',
        lg: 'h-10 px-4 text-[14px]',
        icon: 'h-9 w-9',
        iconSm: 'h-8 w-8',
        iconXs: 'h-7 w-7',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
)

export const Button = forwardRef(function Button(
  { className, variant, size, asChild = false, loading = false, icon, children, type = 'button', disabled, ...props },
  ref,
) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : type}
      className={cn(button({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Icon.spinner size={16} className="animate-spin" /> : icon}
      {children}
    </Comp>
  )
})

// Icon-only delete affordance used in every list/table row.
export const DeleteButton = forwardRef(function DeleteButton({ onClick, title, className, size = 'iconSm' }, ref) {
  return (
    <Button ref={ref} variant="destructiveGhost" size={size} onClick={onClick} title={title} aria-label={title || 'Delete'} className={className}>
      <Icon.trash size={16} />
    </Button>
  )
})

export const IconButton = forwardRef(function IconButton({ label, children, className, size = 'icon', variant = 'ghost', ...props }, ref) {
  return (
    <Button ref={ref} variant={variant} size={size} aria-label={label} title={label} className={className} {...props}>
      {children}
    </Button>
  )
})

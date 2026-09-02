// Popover, Tooltip, Dialog, Sheet — every floating surface, one material.
import { forwardRef } from 'react'
import { Popover as RP, Tooltip as RT, Dialog as RD } from 'radix-ui'
import { cn } from '../../lib/utils.js'
import { Icon } from '../icons.jsx'
import { IconButton } from './button.jsx'

const float = 'z-[300] rounded-md border border-line bg-surface shadow-float text-ink'
const enter = 'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-150'

/* ── Popover ─────────────────────────────────────────────── */
export const Popover = RP.Root
export const PopoverTrigger = RP.Trigger
export const PopoverAnchor = RP.Anchor
export function PopoverContent({ className, align = 'start', sideOffset = 6, children, ...props }) {
  return (
    <RP.Portal>
      <RP.Content align={align} sideOffset={sideOffset} collisionPadding={12} className={cn(float, enter, 'p-3', className)} {...props}>
        {children}
      </RP.Content>
    </RP.Portal>
  )
}

/* ── Tooltip ─────────────────────────────────────────────── */
export const TooltipProvider = RT.Provider
export function Tooltip({ content, children, side = 'top', align = 'center', delay = 250, className, asChild = true }) {
  if (!content) return children
  return (
    <RT.Root delayDuration={delay}>
      <RT.Trigger asChild={asChild}>{children}</RT.Trigger>
      <RT.Portal>
        <RT.Content
          side={side}
          align={align}
          sideOffset={6}
          collisionPadding={8}
          className={cn(
            'z-[400] max-w-64 rounded-sm bg-ink px-2.5 py-1.5 text-[12px] leading-snug text-canvas shadow-float',
            'data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 duration-150',
            className,
          )}
        >
          {content}
        </RT.Content>
      </RT.Portal>
    </RT.Root>
  )
}

/* ── Dialog ──────────────────────────────────────────────── */
export const Dialog = RD.Root
export const DialogTrigger = RD.Trigger
export const DialogClose = RD.Close

// Dialog.Portal wraps each child in a Slot that forwards a ref, so this must forward it.
const Overlay = forwardRef(function Overlay({ className }, ref) {
  return (
    <RD.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-[290] bg-scrim backdrop-blur-[2px]',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 duration-200',
        className,
      )}
    />
  )
})

// `alert` keeps the dialog modal-without-light-dismiss (destructive confirms, PIN).
export function DialogContent({ className, children, alert = false, hideClose = false, closeLabel = 'Close', title, description, ...props }) {
  return (
    <RD.Portal>
      <Overlay />
      <RD.Content
        onPointerDownOutside={alert ? (e) => e.preventDefault() : undefined}
        onInteractOutside={alert ? (e) => e.preventDefault() : undefined}
        className={cn(
          'fixed inset-x-4 top-1/2 z-[300] mx-auto w-auto max-w-md -translate-y-1/2 sm:inset-x-auto sm:start-1/2 sm:w-full sm:-translate-x-1/2 rtl:sm:translate-x-1/2',
          'rounded-lg border border-line bg-surface p-6 shadow-float text-ink outline-none',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-2',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-200',
          className,
        )}
        {...props}
      >
        {title && <RD.Title className="t-h2 text-ink pe-8">{title}</RD.Title>}
        {description
          ? <RD.Description className="mt-1.5 text-ink-2 leading-relaxed">{description}</RD.Description>
          : <RD.Description className="sr-only">{typeof title === 'string' ? title : 'Dialog'}</RD.Description>}
        {children}
        {!hideClose && (
          <RD.Close asChild>
            <IconButton label={closeLabel} size="iconSm" className="absolute top-4 end-4 text-ink-3">
              <Icon.close size={16} />
            </IconButton>
          </RD.Close>
        )}
      </RD.Content>
    </RD.Portal>
  )
}

export function DialogFooter({ className, children }) {
  return <div className={cn('mt-6 flex flex-wrap justify-end gap-2', className)}>{children}</div>
}

/* ── Sheet (side panel) ──────────────────────────────────── */
// side: 'start' | 'end' | 'bottom' — logical, so it mirrors in RTL.
export function SheetContent({ side = 'start', className, children, title, closeLabel = 'Close', ...props }) {
  const sides = {
    start: cn(
      'inset-y-0 start-0 h-full w-[300px] max-w-[85vw] border-e',
      'ltr:data-[state=open]:slide-in-from-left rtl:data-[state=open]:slide-in-from-right',
      'ltr:data-[state=closed]:slide-out-to-left rtl:data-[state=closed]:slide-out-to-right',
    ),
    end: cn(
      'inset-y-0 end-0 h-full w-[300px] max-w-[85vw] border-s',
      'ltr:data-[state=open]:slide-in-from-right rtl:data-[state=open]:slide-in-from-left',
      'ltr:data-[state=closed]:slide-out-to-right rtl:data-[state=closed]:slide-out-to-left',
    ),
    bottom: cn(
      'inset-x-0 bottom-0 max-h-[88vh] rounded-t-lg border-t',
      'data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
    ),
  }
  return (
    <RD.Portal>
      <Overlay />
      <RD.Content
        className={cn(
          'fixed z-[300] flex flex-col bg-surface border-line shadow-float text-ink outline-none overflow-y-auto',
          'data-[state=open]:animate-in data-[state=closed]:animate-out duration-250 ease-out-soft',
          sides[side],
          className,
        )}
        {...props}
      >
        <RD.Title className={title ? 't-h2 px-5 pt-5' : 'sr-only'}>{title || 'Panel'}</RD.Title>
        <RD.Description className="sr-only">{title || 'Panel'}</RD.Description>
        {children}
        <RD.Close asChild>
          <IconButton label={closeLabel} size="iconSm" className="absolute top-3 end-3 text-ink-3">
            <Icon.close size={16} />
          </IconButton>
        </RD.Close>
      </RD.Content>
    </RD.Portal>
  )
}

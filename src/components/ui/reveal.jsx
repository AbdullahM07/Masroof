import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/utils.js'

// In-view reveal (10px rise + fade) driven by IntersectionObserver and CSS,
// so it costs nothing on the main bundle. Respects prefers-reduced-motion
// through the global media query in index.css.
// `lazy` defers rendering children (and any chunk they need) until the block
// is near the viewport; `minHeight` keeps the layout stable meanwhile.
export function Reveal({ children, className, as: Tag = 'div', margin = '0px 0px -40px 0px', lazy = false, minHeight }) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    if (!('IntersectionObserver' in window)) { setSeen(true); return }
    const io = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) { setSeen(true); io.disconnect() }
    }, { rootMargin: lazy ? '200px 0px 200px 0px' : margin })
    io.observe(el)
    // Safety net: never leave content hidden if the observer never fires.
    const timer = setTimeout(() => setSeen(true), lazy ? 8000 : 1200)
    return () => { io.disconnect(); clearTimeout(timer) }
  }, [seen, margin, lazy])
  return (
    <Tag ref={ref} className={cn('reveal', seen && 'is-in', className)} style={!seen && minHeight ? { minHeight } : undefined}>
      {lazy && !seen ? null : children}
    </Tag>
  )
}

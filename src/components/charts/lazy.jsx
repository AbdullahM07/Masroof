// Lazy wrappers so Recharts (~400 kB) loads after the dashboard's first paint.
import { Suspense, lazy } from 'react'
import { Skeleton } from '../ui/controls.jsx'

const mod = () => import('./index.jsx')
const Donut = lazy(() => mod().then(m => ({ default: m.DonutChart })))
const Bars = lazy(() => mod().then(m => ({ default: m.PaymentBars })))
const NetWorth = lazy(() => mod().then(m => ({ default: m.NetWorthChart })))
const Trend = lazy(() => mod().then(m => ({ default: m.TrendChart })))

const fallback = (h) => <Skeleton className="w-full rounded-md" style={{ height: h }} />

export function DonutChart(props) { return <Suspense fallback={fallback(props.height || 220)}><Donut {...props} /></Suspense> }
export function PaymentBars(props) { return <Suspense fallback={fallback(props.height || 220)}><Bars {...props} /></Suspense> }
export function NetWorthChart(props) { return <Suspense fallback={fallback(props.height || 240)}><NetWorth {...props} /></Suspense> }
export function TrendChart(props) { return <Suspense fallback={fallback(props.height || 240)}><Trend {...props} /></Suspense> }

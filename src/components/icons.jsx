// Icon system: Lucide, one stroke weight everywhere (1.75), sized 18px by
// default so glyphs sit on the 4px grid next to 14px text. `Icon.<name>` keeps
// the semantic names the pages use; `CategoryIcon` maps an expense category.
import {
  LayoutDashboard, Wallet, Receipt, ScrollText, CalendarClock, PieChart, Landmark,
  Target, CreditCard, Settings, Search, Plus, Trash2, Pencil, Sun, Moon, Lock, Menu,
  ChevronLeft, ChevronRight, ChevronDown, ChevronsUpDown, Repeat, Banknote, TriangleAlert,
  Paperclip, Check, CircleCheck, Lightbulb, ArrowLeftRight, Calendar, Shield, Gauge,
  TrendingUp, TrendingDown, Download, Upload, X, Delete, Utensils, House, Car, Zap,
  HeartPulse, GraduationCap, ShoppingBag, Clapperboard, PiggyBank, Package, CloudCheck,
  CloudOff, RefreshCw, Sparkles, Info, FileSpreadsheet, FileText, Globe, PanelLeftClose,
  PanelLeftOpen, Ellipsis, Loader2, CircleAlert, ArrowRight, Layers, Languages, LogOut,
  Scale, Filter, CalendarDays,
} from 'lucide-react'

const make = (Glyph) => function LucideIcon({ size = 18, strokeWidth = 1.75, ...p }) {
  return <Glyph size={size} strokeWidth={strokeWidth} absoluteStrokeWidth aria-hidden="true" {...p} />
}

export const Icon = {
  // navigation
  dashboard: make(LayoutDashboard),
  income: make(Wallet),
  expenses: make(Receipt),
  ledger: make(ScrollText),
  subscriptions: make(CalendarClock),
  budgets: make(PieChart),
  accounts: make(Landmark),
  goals: make(Target),
  cards: make(CreditCard),
  settings: make(Settings),

  // KPI / dashboard
  wallet: make(Wallet),
  receipt: make(Receipt),
  trendUp: make(TrendingUp),
  trendDown: make(TrendingDown),
  swap: make(ArrowLeftRight),
  calendar: make(Calendar),
  calendarDays: make(CalendarDays),
  shield: make(Shield),
  forecast: make(Layers),
  gauge: make(Gauge),
  bulb: make(Lightbulb),
  piggy: make(PiggyBank),
  scale: make(Scale),
  sparkles: make(Sparkles),

  // actions / UI
  search: make(Search),
  download: make(Download),
  upload: make(Upload),
  trash: make(Trash2),
  plus: make(Plus),
  close: make(X),
  lock: make(Lock),
  sun: make(Sun),
  moon: make(Moon),
  menu: make(Menu),
  chevronLeft: make(ChevronLeft),
  chevronRight: make(ChevronRight),
  chevronDown: make(ChevronDown),
  chevronsUpDown: make(ChevronsUpDown),
  repeat: make(Repeat),
  cash: make(Banknote),
  globe: make(Globe),
  languages: make(Languages),
  alert: make(TriangleAlert),
  alertCircle: make(CircleAlert),
  edit: make(Pencil),
  paperclip: make(Paperclip),
  check: make(Check),
  checkCircle: make(CircleCheck),
  info: make(Info),
  backspace: make(Delete),
  cloudOk: make(CloudCheck),
  cloudOff: make(CloudOff),
  refresh: make(RefreshCw),
  spinner: make(Loader2),
  excel: make(FileSpreadsheet),
  pdf: make(FileText),
  panelClose: make(PanelLeftClose),
  panelOpen: make(PanelLeftOpen),
  more: make(Ellipsis),
  arrowRight: make(ArrowRight),
  logout: make(LogOut),
  filter: make(Filter),

  // expense categories
  cat_food: make(Utensils),
  cat_rent: make(House),
  cat_transport: make(Car),
  cat_bills: make(Zap),
  cat_health: make(HeartPulse),
  cat_education: make(GraduationCap),
  cat_shopping: make(ShoppingBag),
  cat_entertainment: make(Clapperboard),
  cat_savings: make(PiggyBank),
  cat_debt: make(CreditCard),
  cat_other: make(Package),
}

// Map a category key to its glyph (used everywhere a category is shown).
export function CategoryIcon({ category, ...props }) {
  const Glyph = Icon[`cat_${category}`] || Icon.cat_other
  return <Glyph {...props} />
}

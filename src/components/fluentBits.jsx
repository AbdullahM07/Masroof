// Small Fluent v9 helpers for variants the library doesn't ship out of the box
// (destructive / success buttons, an icon-only delete button). Built with
// Griffel `makeStyles` + Fluent tokens so they theme with light/dark + RTL.
import { Button, makeStyles, mergeClasses, tokens } from '@fluentui/react-components'
import { Icon } from './icons.jsx'

const useStyles = makeStyles({
  danger: {
    backgroundColor: tokens.colorStatusDangerBackground3,
    color: tokens.colorNeutralForegroundOnBrand,
    ':hover': { backgroundColor: tokens.colorStatusDangerBackground3Hover, color: tokens.colorNeutralForegroundOnBrand },
    ':hover:active': { backgroundColor: tokens.colorStatusDangerBackground3Pressed, color: tokens.colorNeutralForegroundOnBrand },
    // reflect the native disabled state (e.g. before the confirm word is typed)
    ':disabled': { backgroundColor: tokens.colorNeutralBackgroundDisabled, color: tokens.colorNeutralForegroundDisabled },
    ':disabled:hover': { backgroundColor: tokens.colorNeutralBackgroundDisabled, color: tokens.colorNeutralForegroundDisabled },
  },
  success: {
    backgroundColor: tokens.colorPaletteGreenBackground3,
    color: tokens.colorNeutralForegroundOnBrand,
    ':hover': { backgroundColor: tokens.colorPaletteGreenForeground1, color: tokens.colorNeutralForegroundOnBrand },
    ':hover:active': { backgroundColor: tokens.colorPaletteGreenForeground1, color: tokens.colorNeutralForegroundOnBrand },
  },
  del: {
    color: tokens.colorNeutralForeground3,
    ':hover': { color: tokens.colorPaletteRedForeground1, backgroundColor: tokens.colorPaletteRedBackground1 },
    ':hover:active': { color: tokens.colorPaletteRedForeground1, backgroundColor: tokens.colorPaletteRedBackground1 },
  },
})

export function DangerButton({ className, ...props }) {
  const s = useStyles()
  return <Button appearance="primary" {...props} className={mergeClasses(s.danger, className)} />
}

export function SuccessButton({ className, ...props }) {
  const s = useStyles()
  return <Button appearance="primary" {...props} className={mergeClasses(s.success, className)} />
}

export function DeleteButton({ onClick, title, size = 'small' }) {
  const s = useStyles()
  return (
    <Button
      appearance="subtle"
      size={size}
      icon={<Icon.trash />}
      className={s.del}
      onClick={onClick}
      title={title}
      aria-label={title || 'Delete'}
    />
  )
}

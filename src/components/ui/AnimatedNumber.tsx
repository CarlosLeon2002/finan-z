import { useAnimatedNumber } from '../../hooks/useAnimatedNumber'
import { cn } from '../../lib/cn'

interface AnimatedNumberProps {
  value: number
  format: (value: number) => string
  className?: string
  duration?: number
}

/** Cifra monetaria (o porcentaje) que se interpola al cambiar de valor. */
export function AnimatedNumber({ value, format, className, duration }: AnimatedNumberProps) {
  const animated = useAnimatedNumber(value, duration)
  return <span className={cn('tabular-nums', className)}>{format(animated)}</span>
}

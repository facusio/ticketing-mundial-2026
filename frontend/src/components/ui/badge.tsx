import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'green' | 'gold' | 'red' | 'blue' | 'gray'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        {
          'bg-slate-700 text-slate-200': variant === 'default',
          'bg-green-500/20 text-green-400 border border-green-500/30': variant === 'green',
          'bg-amber-500/20 text-amber-400 border border-amber-500/30': variant === 'gold',
          'bg-red-500/20 text-red-400 border border-red-500/30': variant === 'red',
          'bg-blue-500/20 text-blue-400 border border-blue-500/30': variant === 'blue',
          'bg-slate-600/50 text-slate-400': variant === 'gray',
        },
        className,
      )}
      {...props}
    />
  )
}

export { Badge }

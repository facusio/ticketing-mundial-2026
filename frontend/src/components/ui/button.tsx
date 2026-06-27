import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'gold'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'default', size = 'md', asChild, loading, children, disabled, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066b2] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
          {
            'bg-[#0066b2] text-white hover:bg-[#0052a3] active:bg-[#003d7a]':
              variant === 'default',
            'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400':
              variant === 'outline',
            'bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white':
              variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700': variant === 'destructive',
            'bg-amber-500 text-slate-900 hover:bg-amber-400 font-bold': variant === 'gold',
          },
          {
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
          },
          className,
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

export { Button }

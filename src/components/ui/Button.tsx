import { type HTMLMotionProps, motion } from 'motion/react'
import { cn } from '../../lib/utils'

const variants = {
  primary: 'bg-white text-zinc-950 hover:bg-zinc-100 shadow-[0_10px_30px_-10px_rgba(255,255,255,0.45)]',
  glass: 'liquid text-zinc-100 hover:text-white hover:bg-white/[0.06]',
  hot: 'bg-hot text-white shadow-[0_12px_40px_-12px_rgba(255,77,90,0.85)] hover:brightness-110',
  cool: 'bg-cool text-zinc-950 shadow-[0_12px_40px_-12px_rgba(56,189,248,0.7)] hover:brightness-110',
  ghost: 'text-zinc-400 hover:text-white hover:bg-white/[0.06]',
  danger: 'text-rose-300 ring-1 ring-inset ring-rose-400/25 hover:bg-rose-500/10 hover:text-rose-200',
} as const

const sizes = {
  xs: 'h-7 gap-1 rounded-full px-2.5 text-xs',
  sm: 'h-8 gap-1.5 rounded-full px-3 text-[13px]',
  md: 'h-10 gap-2 rounded-full px-4 text-sm',
  lg: 'h-12 gap-2.5 rounded-full px-6 text-[15px]',
  icon: 'size-10 rounded-full',
  iconSm: 'size-8 rounded-full',
} as const

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

export function Button({ variant = 'glass', size = 'md', className, type = 'button', ...props }: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'inline-flex shrink-0 cursor-pointer select-none items-center justify-center font-medium whitespace-nowrap transition-[background-color,color,filter,box-shadow] duration-200 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}

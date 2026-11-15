import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'icon' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:pointer-events-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#30c5ce] focus-visible:ring-offset-2';

    // Pure Flat Tactile Squircle Buttons - ZERO BORDERS, ZERO SHADOWS, 10PX CURVE
    const variants = {
      primary: cn(
        'rounded-[10px] bg-[#10393b] text-white',
        'hover:bg-[#154b4d]',
        'active:translate-y-[0.5px] active:bg-[#0c2b2c]'
      ),
      secondary: cn(
        'rounded-[10px] bg-[#eceae2] text-[#10393b]',
        'hover:bg-[#e4e1d7]',
        'active:translate-y-[0.5px] active:bg-[#dbd8cc]'
      ),
      outline: cn(
        'rounded-[10px] bg-black/[0.04] text-[#10393b]',
        'hover:bg-black/[0.08]',
        'active:translate-y-[0.5px]'
      ),
      ghost: cn(
        'rounded-[10px] text-[#555555] hover:text-[#10393b] hover:bg-black/5',
        'active:bg-black/10'
      ),
      icon: cn(
        'rounded-[10px] bg-[#eceae2] text-[#10393b]',
        'hover:bg-[#e4e1d7]',
        'active:translate-y-[0.5px]'
      ),
      accent: cn(
        'rounded-[10px] bg-[#154b4d] text-white',
        'hover:bg-[#10393b]',
        'active:translate-y-[0.5px]'
      ),
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 tracking-tight',
      md: 'text-xs md:text-[13px] px-3.5 md:px-4 py-2 md:py-2.5 gap-1.5 tracking-tight font-medium',
      lg: 'text-sm md:text-base px-6 py-2.5 md:py-3 gap-2 tracking-tight font-medium',
      icon: 'w-8 h-8 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export function ButtonGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-[10px] bg-[#eceae2] p-1 gap-1',
        className
      )}
    >
      {children}
    </div>
  );
}

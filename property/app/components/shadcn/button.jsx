import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/**
 * shadcn/ui Button, restyled to the EasyMoveZone 6px button. `asChild` lets it wrap a
 * react-router <Link> without nesting interactive elements.
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-button font-sans text-sm font-semibold ring-offset-background transition-[transform,background-color,box-shadow,border-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer border-[1.5px]',
  {
    variants: {
      variant: {
        default: 'bg-brand-deep border-brand-deep text-white hover:bg-brand-forest hover:border-brand-forest hover:text-white hover:-translate-y-px hover:shadow-card',
        // Was a pale green for dark bands; on the white site it is the main action again.
        bright: 'bg-brand-deep border-brand-deep text-white hover:bg-brand-forest hover:border-brand-forest hover:text-white hover:-translate-y-px hover:shadow-card',
        dark: 'bg-brand-black border-brand-black text-white hover:bg-[var(--color-black-soft)] hover:text-white hover:-translate-y-px',
        outline: 'bg-white border-[var(--color-line-strong)] text-brand-ink hover:border-brand-deep hover:text-brand-deep hover:-translate-y-px',
        glass: 'bg-[rgba(6,24,16,0.55)] border-white/30 text-white backdrop-blur-md hover:bg-[rgba(6,24,16,0.8)] hover:text-white',
        soft: 'bg-brand-soft border-brand-soft text-brand-deep hover:bg-brand-chip hover:border-brand-chip hover:text-brand-forest',
        ghost: 'border-transparent bg-transparent text-brand-ink hover:bg-accent hover:text-brand-deep',
        link: 'border-transparent bg-transparent text-brand-deep underline-offset-4 hover:underline px-0',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-9 px-4 text-[0.82rem]',
        lg: 'h-12 px-6 text-[0.95rem]',
        xl: 'h-[54px] px-7 text-base',
        icon: 'h-10 w-10 p-0',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'default', size: 'default', block: false },
  },
);

export const Button = React.forwardRef(({ className, variant, size, block, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, block, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

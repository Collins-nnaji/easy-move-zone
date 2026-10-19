import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-pill border px-2.5 py-0.5 text-[0.68rem] font-bold uppercase tracking-[0.08em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-brand-deep text-white',
        soft: 'border-[rgba(47, 93, 80,0.2)] bg-brand-soft text-brand-deep',
        chip: 'border-transparent bg-brand-chip text-brand-forest normal-case tracking-normal text-[0.75rem] font-semibold',
        dark: 'border-[var(--color-line-strong)] bg-white text-brand-deep',
        glass: 'border-white/20 bg-[rgba(8,34,22,0.72)] text-[#d9e9df]',
        outline: 'border-[var(--color-line-strong)] text-brand-ink',
        count: 'border-transparent bg-brand-green text-white min-w-[18px] h-[18px] justify-center px-1 text-[0.62rem] rounded-full',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '../../lib/utils';

export const Progress = React.forwardRef(({ className, value = 0, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn('relative h-2 w-full overflow-hidden rounded-full bg-[var(--color-bg-sunken)]', className)}
    value={value}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn('h-full w-full flex-1 rounded-full bg-brand-green transition-transform duration-500 ease-out', indicatorClassName)}
      style={{ transform: `translateX(-${100 - Math.max(0, Math.min(100, value))}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = 'Progress';

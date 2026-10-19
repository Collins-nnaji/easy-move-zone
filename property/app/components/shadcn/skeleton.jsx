import * as React from 'react';
import { cn } from '../../lib/utils';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-md bg-[linear-gradient(90deg,var(--color-bg-sunken)_25%,var(--color-bg-panel)_50%,var(--color-bg-sunken)_75%)] bg-[length:200%_100%] animate-shimmer',
        className,
      )}
      {...props}
    />
  );
}

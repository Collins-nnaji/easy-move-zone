import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import { cn } from '../../lib/utils';

/** shadcn/ui Drawer (vaul) — the bottom sheet with a drag handle, for phones. */
export function Drawer({ shouldScaleBackground = false, ...props }) {
  return <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />;
}

export const DrawerTrigger = DrawerPrimitive.Trigger;
export const DrawerPortal = DrawerPrimitive.Portal;
export const DrawerClose = DrawerPrimitive.Close;

export const DrawerOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay ref={ref} className={cn('fixed inset-0 z-[1200] bg-[rgba(10,15,12,0.55)] backdrop-blur-[2px]', className)} {...props} />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

export const DrawerContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        'fixed inset-x-0 bottom-0 z-[1210] flex max-h-[88svh] flex-col rounded-t-[22px] border border-b-0 border-[var(--color-line)] bg-white shadow-lift focus:outline-none',
        className,
      )}
      {...props}
    >
      <div className="mx-auto mt-3 h-1.5 w-11 shrink-0 rounded-full bg-[var(--color-line-strong)]" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = 'DrawerContent';

export function DrawerHeader({ className, ...props }) {
  return <div className={cn('grid gap-1 px-5 pt-3 pb-2 text-left', className)} {...props} />;
}

export function DrawerFooter({ className, ...props }) {
  return <div className={cn('mt-auto flex flex-col gap-2 px-5 pb-safe pt-3', className)} {...props} />;
}

export const DrawerTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title ref={ref} className={cn('font-display text-lg font-semibold leading-none tracking-tight text-brand-ink', className)} {...props} />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

export const DrawerDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DrawerPrimitive.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

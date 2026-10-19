import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * Collapsible form sections. A long form becomes a stack of titled cards;
 * each header carries a step number, a one-line summary of what is inside
 * (or what has been filled in) and a state chip, so a collapsed section still
 * tells the reader what it needs.
 *
 *   <FormSections defaultOpen={['details']}>
 *     <FormSection id="details" step={1} title="Property details" required done={...}>…</FormSection>
 *   </FormSections>
 */
export function FormSections({ defaultOpen = [], className, children }) {
  return (
    <AccordionPrimitive.Root type="multiple" defaultValue={defaultOpen} className={cn('flex flex-col gap-3', className)}>
      {children}
    </AccordionPrimitive.Root>
  );
}

export function FormSection({ id, step, title, summary, required = false, done = false, icon: Icon, className, children }) {
  return (
    <AccordionPrimitive.Item
      value={id}
      className={cn(
        'overflow-hidden rounded-[14px] border bg-white transition-colors data-[state=open]:border-[var(--color-line-strong)]',
        done ? 'border-[rgba(47, 93, 80,0.4)]' : 'border-[var(--color-line-strong)]',
        className,
      )}
    >
      <AccordionPrimitive.Header className="m-0">
        <AccordionPrimitive.Trigger
          className="group flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-4 py-3.5 text-left font-sans hover:bg-[var(--color-bg-panel)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            className={cn(
              'grid h-8 w-8 shrink-0 place-items-center rounded-[9px] font-display text-[0.8rem] font-bold',
              done ? 'bg-brand-deep text-white' : 'bg-brand-soft text-brand-deep',
            )}
            aria-hidden="true"
          >
            {done ? <Check className="h-4 w-4" strokeWidth={3} /> : Icon ? <Icon className="h-4 w-4" /> : step}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="text-[0.98rem] font-semibold text-brand-ink">{title}</span>
              {required && !done && (
                <span className="rounded-pill bg-[var(--color-bg-sunken)] px-1.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.06em] text-[var(--color-ink-faint)]">Required</span>
              )}
              {!required && !done && (
                <span className="rounded-pill bg-[var(--color-bg-sunken)] px-1.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.06em] text-[var(--color-ink-faint)]">Optional</span>
              )}
            </span>
            {summary && <span className="block truncate text-[0.8rem] text-muted-foreground group-data-[state=open]:hidden">{summary}</span>}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-brand-deep transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="border-t border-[var(--color-line)] px-4 pb-4 pt-4">{children}</div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}

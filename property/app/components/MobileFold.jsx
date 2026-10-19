import React from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './shadcn/accordion';
import { useIsMobile } from '../utils/useMediaQuery';

/**
 * Long content, folded on phones. Desktop renders everything as written; a
 * phone gets the start and a drop-down for the rest, so a page reads as
 * headings and figures rather than a wall of text.
 */

/**
 * A list that shows its first `show` items on phones and keeps the rest
 * behind "See all". `render(item, i)` draws one item; `wrap(nodes)` wraps a
 * run of them (e.g. in a CheckGrid) so both halves keep the list's styling.
 */
export function MobileMore({
  items, show = 3, render, wrap = (nodes) => nodes, label,
}) {
  const mobile = useIsMobile();
  if (!mobile || items.length <= show + 1) return wrap(items.map(render));
  const rest = items.slice(show);
  return (
    <>
      {wrap(items.slice(0, show).map(render))}
      <Accordion type="single" collapsible>
        <AccordionItem value="more" className="border-b-0">
          <AccordionTrigger className="text-brand-deep">{label || `See all ${items.length}`}</AccordionTrigger>
          <AccordionContent>{wrap(rest.map((item, i) => render(item, i + show)))}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}

/** One block that is open on desktop and a drop-down titled `title` on phones. */
export function MobileFold({ title, children, className }) {
  const mobile = useIsMobile();
  if (!mobile) return children;
  return (
    <Accordion type="single" collapsible className={className}>
      <AccordionItem value="fold" className="border-b-0">
        <AccordionTrigger>{title}</AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

/**
 * A document split into drop-downs at each `heading` element (e.g. the legal
 * pages' H2s). Desktop renders the children untouched.
 */
export function FoldByHeading({ heading, children }) {
  const mobile = useIsMobile();
  if (!mobile) return children;
  const groups = [];
  React.Children.toArray(children).forEach((child) => {
    if (child.type === heading) groups.push({ title: child.props.children, body: [] });
    else if (groups.length) groups[groups.length - 1].body.push(child);
  });
  return (
    <Accordion type="multiple">
      {groups.map((g, i) => (
        <AccordionItem key={i} value={String(i)}>
          <AccordionTrigger>{g.title}</AccordionTrigger>
          <AccordionContent>{g.body}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

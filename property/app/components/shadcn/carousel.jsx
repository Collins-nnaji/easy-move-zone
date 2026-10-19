import * as React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

/**
 * shadcn/ui Carousel on Embla. Adds `CarouselDots`, which the stock version
 * lacks, because on a phone the dots are the only affordance that says
 * "there is more to the right".
 */
const CarouselContext = React.createContext(null);

export function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error('useCarousel must be used within a <Carousel />');
  return context;
}

export const Carousel = React.forwardRef(({ orientation = 'horizontal', opts, setApi, plugins, className, children, ...props }, ref) => {
  const [carouselRef, api] = useEmblaCarousel({ ...opts, axis: orientation === 'horizontal' ? 'x' : 'y' }, plugins);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [selected, setSelected] = React.useState(0);
  const [count, setCount] = React.useState(0);

  const onSelect = React.useCallback((a) => {
    if (!a) return;
    setCanScrollPrev(a.canScrollPrev());
    setCanScrollNext(a.canScrollNext());
    setSelected(a.selectedScrollSnap());
    setCount(a.scrollSnapList().length);
  }, []);

  const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);
  const scrollTo = React.useCallback((i) => api?.scrollTo(i), [api]);

  const handleKeyDown = React.useCallback((event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); scrollPrev(); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); scrollNext(); }
  }, [scrollPrev, scrollNext]);

  React.useEffect(() => { if (api && setApi) setApi(api); }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return undefined;
    onSelect(api);
    api.on('reInit', onSelect);
    api.on('select', onSelect);
    return () => { api.off('select', onSelect); api.off('reInit', onSelect); };
  }, [api, onSelect]);

  const value = React.useMemo(() => ({
    carouselRef, api, opts, orientation, scrollPrev, scrollNext, scrollTo, canScrollPrev, canScrollNext, selected, count,
  }), [carouselRef, api, opts, orientation, scrollPrev, scrollNext, scrollTo, canScrollPrev, canScrollNext, selected, count]);

  return (
    <CarouselContext.Provider value={value}>
      <div ref={ref} onKeyDownCapture={handleKeyDown} className={cn('relative', className)} role="region" aria-roledescription="carousel" {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
});
Carousel.displayName = 'Carousel';

export const CarouselContent = React.forwardRef(({ className, ...props }, ref) => {
  const { carouselRef, orientation } = useCarousel();
  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div ref={ref} className={cn('flex', orientation === 'horizontal' ? '-ml-3' : '-mt-3 flex-col', className)} {...props} />
    </div>
  );
});
CarouselContent.displayName = 'CarouselContent';

export const CarouselItem = React.forwardRef(({ className, ...props }, ref) => {
  const { orientation } = useCarousel();
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cn('min-w-0 shrink-0 grow-0 basis-full', orientation === 'horizontal' ? 'pl-3' : 'pt-3', className)}
      {...props}
    />
  );
});
CarouselItem.displayName = 'CarouselItem';

export const CarouselPrevious = React.forwardRef(({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
  const { scrollPrev, canScrollPrev } = useCarousel();
  return (
    <Button ref={ref} variant={variant} size={size} className={cn('h-9 w-9 rounded-full', className)} disabled={!canScrollPrev} onClick={scrollPrev} {...props}>
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
});
CarouselPrevious.displayName = 'CarouselPrevious';

export const CarouselNext = React.forwardRef(({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
  const { scrollNext, canScrollNext } = useCarousel();
  return (
    <Button ref={ref} variant={variant} size={size} className={cn('h-9 w-9 rounded-full', className)} disabled={!canScrollNext} onClick={scrollNext} {...props}>
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  );
});
CarouselNext.displayName = 'CarouselNext';

export function CarouselDots({ className, dark = false }) {
  const { selected, count, scrollTo } = useCarousel();
  if (count < 2) return null;
  return (
    <div className={cn('mt-3 flex items-center justify-center gap-1.5', className)} role="tablist" aria-label="Slides">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === selected}
          aria-label={`Go to slide ${i + 1}`}
          onClick={() => scrollTo(i)}
          className={cn(
            'h-1.5 cursor-pointer rounded-full border-0 p-0 transition-all duration-300',
            i === selected
              ? cn('w-5', dark ? 'bg-brand-mint' : 'bg-brand-deep')
              : cn('w-1.5', dark ? 'bg-white/35' : 'bg-[var(--color-line-strong)]'),
          )}
        />
      ))}
    </div>
  );
}

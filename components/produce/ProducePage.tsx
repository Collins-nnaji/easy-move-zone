import type { ReactNode } from "react";

const INK = "#1b231e";

export function ProducePage({
  eyebrow,
  title,
  lede,
  children,
  aside,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div style={{ background: "#faf8f2", color: INK }}>
      <section className="border-b border-[#d7ddcd] bg-[#eeefe5]">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)] lg:items-end lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#e0511f]">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-6xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#5f655c] sm:text-lg">
              {lede}
            </p>
          </div>
          {aside}
        </div>
      </section>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {children}
      </div>
    </div>
  );
}

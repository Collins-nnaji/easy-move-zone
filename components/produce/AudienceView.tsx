import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProducePage } from "@/components/produce/ProducePage";
import { AUDIENCES, type AudienceId } from "@/lib/produce/catalog";

const PRIMARY = "#2f5d50";

export function AudienceView({ id }: { id: AudienceId }) {
  const audience = AUDIENCES[id];
  return (
    <ProducePage
      eyebrow="How we help"
      title={audience.title}
      lede={audience.lede}
    >
      <div className="grid gap-8 md:grid-cols-3">
        {audience.points.map((point, index) => (
          <article key={point.title} className="border-t border-[#bdc7b3] py-6">
            <p className="text-xs font-extrabold text-[#2f5d50]">
              0{index + 1}
            </p>
            <h2 className="mt-2 text-lg font-extrabold">{point.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5f655c]">
              {point.body}
            </p>
          </article>
        ))}
      </div>
      <Link
        href={audience.cta.href}
        className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 text-[15px] font-bold text-white"
        style={{
          background: PRIMARY,
          boxShadow: "0 12px 28px rgba(47,93,80,.24)",
        }}
      >
        {audience.cta.label}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </ProducePage>
  );
}

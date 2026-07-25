import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

type SiteLogoProps = {
  href?: string | null;
  height?: number;
  className?: string;
  priority?: boolean;
  invert?: boolean;
};

export function SiteLogo({
  href = "/",
  height = 32,
  className = "",
  priority = false,
  invert = false,
}: SiteLogoProps) {
  // Derive width from the logo's real aspect ratio — the previous hardcoded
  // 1.625 was narrower than the artwork (2.8), squashing the wordmark.
  const width = Math.round(height * BRAND.logoAspect);

  const image = (
    <Image
      src={BRAND.logo}
      alt={BRAND.logoAlt}
      width={width}
      height={height}
      className={`object-contain ${invert ? "brightness-0 invert" : ""} ${className}`}
      style={{ height, width: "auto", maxWidth: width }}
      priority={priority}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center transition hover:opacity-85">
        {image}
      </Link>
    );
  }

  return <span className="inline-flex shrink-0 items-center">{image}</span>;
}

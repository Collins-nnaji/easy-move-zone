"use client"

import Link from "next/link"
import Image from "next/image"
import { clsx } from "clsx"

type BrandLogoLinkProps = {
  href?: string
  className?: string
  /** Top nav: compact height. Sidebar / onboarding bar: slightly smaller wordmark slot */
  size?: "nav" | "sidebar"
}

export function BrandLogoLink({ href = "/", className, size = "sidebar" }: BrandLogoLinkProps) {
  const isNav = size === "nav"
  return (
    <Link
      href={href}
      className={clsx("flex shrink-0 items-center transition hover:opacity-85", className)}
    >
      <Image
        src="/emz.svg"
        alt="EasyMoveZone"
        width={isNav ? 160 : 140}
        height={isNav ? 36 : 32}
        className={clsx(
          "w-auto object-contain object-left",
          isNav ? "h-8 max-h-8 sm:h-9 sm:max-h-9" : "h-7 max-h-7 sm:h-8 sm:max-h-8"
        )}
        priority
      />
    </Link>
  )
}

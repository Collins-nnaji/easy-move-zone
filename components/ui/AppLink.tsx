"use client"

import NextLink from "next/link"
import type { AnchorHTMLAttributes, ReactNode } from "react"
import { Link as RouterLink, useInRouterContext } from "react-router-dom"

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string
  children?: ReactNode
}

/**
 * A link that works in both halves of the app. Inside the property site
 * (react-router, app/property-app) it routes with react-router, so the page
 * keeps the site's navbar and state; elsewhere it is a Next.js link.
 * Pages that are not part of the property site (/auth, /api/…) always get a
 * full page load.
 */
export default function AppLink({ href, ...props }: Props) {
  const inRouter = useInRouterContext()
  if (inRouter) {
    if (href.startsWith("/auth") || href.startsWith("/api/") || /^[a-z]+:/i.test(href) || href.startsWith("//")) {
      return <a href={href} {...props} />
    }
    return <RouterLink to={href} {...props} />
  }
  return <NextLink href={href} {...props} />
}

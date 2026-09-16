"use client";

import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface ActiveLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  exact?: boolean;
}

export function ActiveLink({
  href,
  children,
  className,
  activeClassName,
  exact = false,
  ...props
}: ActiveLinkProps) {
  const pathname = usePathname();
  const hrefStr = href.toString();
  const isActive = exact ? pathname === hrefStr : pathname.startsWith(hrefStr);

  return (
    <Link
      href={href}
      className={cn(className, isActive && activeClassName)}
      aria-current={isActive ? "page" : undefined}
      {...props}
    >
      {children}
    </Link>
  );
}

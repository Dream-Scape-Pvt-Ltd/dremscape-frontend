"use client";

import * as React from "react";
import { Navbar } from "./navbar";
import { MobileNav } from "./mobile-nav";
import { useDisclosure } from "@/hooks/use-disclosure";

export function Header() {
  const { isOpen, open, close } = useDisclosure(false);

  return (
    <>
      <Navbar onOpenMobileNav={open} />
      <MobileNav isOpen={isOpen} onClose={close} />
    </>
  );
}

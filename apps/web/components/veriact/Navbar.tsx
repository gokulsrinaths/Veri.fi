"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LayoutDashboard, ListTodo, PlusCircle, Menu, Zap, BookOpen, GitBranch } from "lucide-react";
import { CreditcoinWallet } from "@/components/CreditcoinWallet";
import { useWallet } from "@/components/WalletContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isConnected } = useWallet();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass = (active: boolean, isCta?: boolean) =>
    cn(
      "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium min-w-[44px] min-h-[44px]",
      active
        ? isCta
          ? "bg-emerald-500/20 text-emerald-400"
          : "bg-zinc-800 text-white"
        : isCta
          ? "text-emerald-400 hover:bg-emerald-500/10"
          : "text-zinc-400 hover:text-white hover:bg-zinc-800"
    );

  const dashboardLink = (
    <Link
      href="/dashboard"
      className={linkClass(pathname === "/dashboard")}
      onClick={() => setOpen(false)}
    >
      <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden />
      <span>Dashboard</span>
    </Link>
  );

  const exploreTasksLink = (
    <Link
      href="/tasks"
      className={linkClass(pathname === "/tasks")}
      onClick={() => setOpen(false)}
    >
      <ListTodo className="h-4 w-4 shrink-0" aria-hidden />
      <span>Explore Tasks</span>
    </Link>
  );

  const createTaskLink = (
    <Link
      href="/tasks/create"
      className={linkClass(pathname === "/tasks/create", true)}
      onClick={() => setOpen(false)}
    >
      <PlusCircle className="h-4 w-4 shrink-0" aria-hidden />
      <span>Create Task</span>
    </Link>
  );

  const demoLink = (
    <Link
      href="/demo"
      className={linkClass(pathname === "/demo", true)}
      onClick={() => setOpen(false)}
    >
      <Zap className="h-4 w-4 shrink-0" aria-hidden />
      <span>Demo</span>
    </Link>
  );

  const protocolLink = (
    <Link
      href="/protocol"
      className={linkClass(pathname === "/protocol")}
      onClick={() => setOpen(false)}
    >
      <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
      <span>Protocol</span>
    </Link>
  );

  const howItWorksLink = (
    <Link
      href="/how-it-works"
      className={linkClass(pathname === "/how-it-works")}
      onClick={() => setOpen(false)}
    >
      <GitBranch className="h-4 w-4 shrink-0" aria-hidden />
      <span>How it works</span>
    </Link>
  );

  return (
    <nav
      className={cn(
        "sticky top-0 z-40 border-b px-4 py-3 transition-colors duration-200",
        scrolled ? "border-zinc-800 bg-zinc-950/80 backdrop-blur-md" : "border-zinc-800 bg-zinc-950"
      )}
      aria-label="Main navigation"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight px-2 py-1.5 rounded-lg hover:opacity-90 text-zinc-50"
        >
          veri<span className="text-emerald-400">.fi</span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          {isConnected && dashboardLink}
          {exploreTasksLink}
          {createTaskLink}
          {demoLink}
          <CreditcoinWallet />
        </div>

        <div className="md:hidden flex items-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                aria-expanded={open}
                aria-controls="nav-sheet"
                aria-label={open ? "Close menu" : "Open menu"}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="top"
              id="nav-sheet"
              className="border-b border-zinc-800 bg-zinc-950"
            >
              <SheetHeader>
                <SheetTitle className="sr-only">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 pt-6 text-zinc-50">
                {isConnected && dashboardLink}
                {exploreTasksLink}
                {createTaskLink}
                {protocolLink}
                {howItWorksLink}
                {demoLink}
                <div className="pt-4 border-t border-zinc-800">
                  <CreditcoinWallet />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

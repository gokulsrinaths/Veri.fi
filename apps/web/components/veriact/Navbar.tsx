"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { clsx } from "clsx";
import { LayoutDashboard, ListTodo, PlusCircle, Menu, X } from "lucide-react";

const navClass = (active: boolean, isCta?: boolean) =>
  clsx(
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus-ring min-w-[44px] min-h-[44px]",
    active
      ? isCta
        ? "bg-emerald-500/20 text-emerald-400"
        : "bg-white/10 text-white"
      : isCta
        ? "text-emerald-400 hover:bg-emerald-500/10"
        : "text-white/70 hover:text-white hover:bg-white/5"
  );

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = (
    <>
      <Link
        href="/"
        className={navClass(pathname === "/")}
        onClick={() => setOpen(false)}
      >
        <LayoutDashboard className="w-4 h-4" aria-hidden />
        <span>Dashboard</span>
      </Link>
      <Link
        href="/tasks"
        className={navClass(pathname === "/tasks")}
        onClick={() => setOpen(false)}
      >
        <ListTodo className="w-4 h-4" aria-hidden />
        <span>Explore Tasks</span>
      </Link>
      <Link
        href="/tasks/create"
        className={navClass(pathname === "/tasks/create", true)}
        onClick={() => setOpen(false)}
      >
        <PlusCircle className="w-4 h-4" aria-hidden />
        <span>Create Task</span>
      </Link>
    </>
  );

  return (
    <nav
      className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-xl px-4 py-3"
      aria-label="Main navigation"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-white hover:text-white/90 transition focus-ring rounded-lg px-2 py-1.5"
        >
          Veri<span className="text-emerald-400">Act</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">{links}</div>

        {/* Mobile: hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex items-center justify-center w-11 h-11 rounded-lg text-white/80 hover:bg-white/10 focus-ring"
            aria-expanded={open}
            aria-controls="nav-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="nav-menu"
        className={clsx(
          "md:hidden overflow-hidden transition-all duration-200",
          open ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        )}
        aria-hidden={!open}
      >
        <div className="pt-2 pb-4 flex flex-col gap-1">{links}</div>
      </div>
    </nav>
  );
}

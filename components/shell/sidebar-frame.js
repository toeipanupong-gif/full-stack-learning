"use client";

import { useEffect, useState } from "react";

export function SidebarFrame({
  containerClassName,
  title,
  titleClassName = "",
  leading = null,
  menuId,
  navLabel,
  openLabel,
  closeLabel,
  children,
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-50" data-sidebar-state={open ? "open" : "closed"}>
        <div className="border-b border-rule bg-paper-raised/95 backdrop-blur-sm">
          <div className={`${containerClassName} flex h-14 items-center gap-3`}>
            {leading}
            <p className={`min-w-0 flex-1 truncate font-ui text-sm font-medium text-ink ${titleClassName}`}>{title}</p>
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-rule text-ink"
              aria-expanded={open}
              aria-controls={menuId}
              onClick={() => setOpen((value) => !value)}
            >
              <span className="sr-only">{open ? closeLabel : openLabel}</span>
              <MenuIcon open={open} />
            </button>
          </div>
        </div>
      </header>

      <button
        type="button"
        className={`fixed inset-0 top-14 z-30 bg-[#2a241c]/25 transition-opacity duration-300 ease-in-out ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-label={closeLabel}
        aria-hidden={open ? undefined : true}
        tabIndex={open ? 0 : -1}
        onClick={close}
      />
      <nav
        id={menuId}
        aria-label={navLabel}
        inert={!open}
        className={`fixed top-14 bottom-0 left-0 z-40 w-72 max-w-[calc(100vw-3rem)] scroll-auto overflow-y-auto border-r border-rule bg-paper-raised transition-transform duration-300 ease-in-out ${
          open
            ? "translate-x-0 shadow-[8px_0_32px_rgba(42,36,28,0.12)]"
            : "pointer-events-none -translate-x-full shadow-none"
        }`}
      >
        {typeof children === "function" ? children(close, open) : children}
      </nav>
    </>
  );
}

function MenuIcon({ open }) {
  const bar = "absolute left-0 block h-0.5 w-5 origin-center rounded-full bg-current transition-all duration-300 ease-in-out";

  return (
    <span className="relative block h-3.5 w-5" aria-hidden="true">
      <span className={`${bar} ${open ? "top-1.5 rotate-45" : "top-0"}`} />
      <span className={`${bar} top-1.5 ${open ? "scale-x-0 opacity-0" : "opacity-100"}`} />
      <span className={`${bar} ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
    </span>
  );
}

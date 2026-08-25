"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from "lucide-react";
import { SEARCH_INDEX, SearchItem } from "@/lib/searchIndex";

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl+K / Cmd+K to open, Esc to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      // focus after the modal mounts
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return SEARCH_INDEX.slice(0, 8);
    const q = query.toLowerCase();
    return SEARCH_INDEX.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [query]);

  const grouped = useMemo(() => {
    const map = new Map<string, SearchItem[]>();
    for (const item of results) {
      if (!map.has(item.group)) map.set(item.group, []);
      map.get(item.group)!.push(item);
    }
    return Array.from(map.entries());
  }, [results]);

  const go = (item: SearchItem) => {
    setOpen(false);
    router.push(item.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) go(item);
    }
  };

  if (!open) return null;

  let flatIndex = -1;

  return (
    <div className="biz-cmdk-overlay" onClick={() => setOpen(false)}>
      <div
        className="biz-cmdk"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="biz-cmdk__input-row">
          <Search size={16} className="biz-cmdk__search-icon" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, masters, vouchers…"
            className="biz-cmdk__input"
          />
          <kbd className="biz-cmdk__esc">Esc</kbd>
        </div>

        <div className="biz-cmdk__results">
          {grouped.length === 0 && (
            <p className="biz-cmdk__empty">No results for &quot;{query}&quot;</p>
          )}
          {grouped.map(([group, items]) => (
            <div key={group} className="biz-cmdk__group">
              <p className="biz-cmdk__group-label">{group}</p>
              {items.map((item) => {
                flatIndex += 1;
                const isActive = flatIndex === activeIndex;
                return (
                  <button
                    key={item.href}
                    className="biz-cmdk__item"
                    data-active={isActive}
                    onMouseEnter={() => setActiveIndex(flatIndex)}
                    onClick={() => go(item)}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="biz-cmdk__footer">
          <span>
            <ArrowUp size={11} /> <ArrowDown size={11} /> to navigate
          </span>
          <span>
            <CornerDownLeft size={11} /> to open
          </span>
        </div>
      </div>

      <style jsx>{`
        .biz-cmdk-overlay {
          position: fixed;
          inset: 0;
          background: rgba(19, 31, 54, 0.45);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 12vh;
          z-index: 10002;
          animation: biz-fade-in 0.12s ease-out;
        }
        .biz-cmdk {
          width: 100%;
          max-width: 560px;
          max-height: 60vh;
          display: flex;
          flex-direction: column;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 24px 60px rgba(19, 31, 54, 0.3);
          overflow: hidden;
          margin: 0 16px;
        }
        .biz-cmdk__input-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(28, 43, 72, 0.1);
        }
        .biz-cmdk__search-icon {
          color: #8890a0;
          flex-shrink: 0;
        }
        .biz-cmdk__input {
          flex: 1;
          border: none;
          outline: none;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 14.5px;
          color: #1c2b48;
        }
        .biz-cmdk__esc {
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 10.5px;
          color: #8890a0;
          border: 1px solid rgba(28, 43, 72, 0.16);
          border-radius: 4px;
          padding: 2px 6px;
        }
        .biz-cmdk__results {
          overflow-y: auto;
          padding: 8px;
        }
        .biz-cmdk__empty {
          padding: 20px;
          text-align: center;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 13px;
          color: #8890a0;
        }
        .biz-cmdk__group {
          margin-bottom: 6px;
        }
        .biz-cmdk__group-label {
          margin: 6px 10px 4px;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #8890a0;
        }
        .biz-cmdk__item {
          display: block;
          width: 100%;
          text-align: left;
          padding: 9px 10px;
          border: none;
          border-radius: 6px;
          background: transparent;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 13.5px;
          color: #1c2b48;
          cursor: pointer;
        }
        .biz-cmdk__item[data-active="true"] {
          background: #fbf5ea;
          color: #1c2b48;
        }
        .biz-cmdk__footer {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 9px 16px;
          border-top: 1px solid rgba(28, 43, 72, 0.1);
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 11px;
          color: #8890a0;
        }
        .biz-cmdk__footer span {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        @keyframes biz-fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
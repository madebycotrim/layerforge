// src/components/BaseSearchSelect.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

export default function SearchSelect({
  value,
  onChange,
  options = [],
  renderValue,
  renderOption,
  placeholder = "Selecione...",
  searchable = false,
  zIndex = "z-[9999]",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  /* ---------- CLICK FORA ---------- */
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (ref.current && ref.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  /* ---------- LIMPAR BUSCA AO FECHAR ---------- */
  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  /* ---------- FECHA SE VALUE MUDAR EXTERNAMENTE ---------- */
  useEffect(() => {
    setOpen(false);
  }, [value]);

  /* ---------- ITEM SELECIONADO ---------- */
  const selectedItem = useMemo(() => {
    return options
      .flatMap((g) => g.items || [])
      .find((i) => i.value === value);
  }, [options, value]);

  /* ---------- FILTRO ---------- */
  const filteredOptions = useMemo(() => {
    if (!searchable || !search) return options;

    return options
      .map((group) => ({
        ...group,
        items: (group.items || []).filter((item) =>
          item.label.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [options, search, searchable]);

  return (
    <div ref={ref} className="relative">
      {/* TRIGGER */}
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen((prev) => !prev);
        }}
        className={`
          w-full h-11 px-3
          bg-zinc-950 border rounded-xl
          flex items-center justify-between cursor-pointer
          transition-all
          ${open
            ? "border-sky-500 ring-1 ring-sky-500/20"
            : "border-zinc-800 hover:border-zinc-700"
          }
        `}
      >
        <div className="truncate text-xs text-zinc-300">
          {selectedItem ? renderValue(selectedItem) : placeholder}
        </div>

        <ChevronDown
          size={14}
          className={`text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""
            }`}
        />
      </div>

      {/* DROPDOWN */}
      {open && (
        <div
          className={`
            absolute top-[calc(100%+4px)] left-0 w-full
            bg-zinc-950 border border-zinc-800
            rounded-xl shadow-2xl shadow-black/50
            animate-in fade-in zoom-in-95 duration-100
            ${zIndex}
          `}
        >
          {/* SEARCH */}
          {searchable && (
            <div className="p-2 border-b border-zinc-800">
              <div className="relative">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  autoFocus
                  value={search}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="
                    w-full h-8 rounded-lg
                    bg-zinc-950 border border-zinc-800
                    pl-8 pr-2 text-[11px] text-zinc-300
                    outline-none transition-all
                    placeholder:text-zinc-600
                    focus:border-zinc-700
                  "
                />
              </div>
            </div>
          )}

          {/* OPTIONS */}
          <div
            className="max-h-56 overflow-y-auto custom-scrollbar p-1 pr-2"
            style={{ scrollbarGutter: "stable" }}
          >
            {filteredOptions.map((group, gi) => (
              <div key={`${group.group || "group"}-${gi}`}>
                {group.group && (
                  <div className="px-2 py-1.5 text-[9px] font-bold text-zinc-500 uppercase">
                    {group.group}
                  </div>
                )}

                {(group.items || []).map((item) => (
                  <div
                    key={item.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(item.value);
                      setOpen(false);
                    }}
                    className={`
                      px-3 py-2 rounded-lg cursor-pointer
                      flex items-center justify-between text-[11px] transition-colors
                      ${value === item.value
                        ? "bg-sky-500/10 text-sky-400 font-medium"
                        : "text-zinc-300 hover:bg-zinc-800"
                      }
                    `}
                  >
                    {renderOption(item)}
                    {value === item.value && <Check size={12} />}
                  </div>
                ))}
              </div>
            ))}

            {filteredOptions.length === 0 && (
              <div className="p-4 text-center text-[10px] text-zinc-500">
                Nenhuma opção encontrada.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

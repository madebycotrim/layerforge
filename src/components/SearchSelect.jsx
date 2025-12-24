import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function SearchSelect({
  value,
  onChange,
  options = [],
  renderValue,
  renderOption,
  placeholder = "ESCOLHA...",
  searchable = false,
  zIndex = "z-[9999]",
  variant = "default", // 'default' ou 'ghost'
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedItem = useMemo(() => {
    if (!value) return null;
    for (const group of options) {
      const found = group.items?.find((i) => String(i.value) === String(value));
      if (found) return found;
    }
    return null;
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    return options
      .map((group) => ({
        ...group,
        items: (group.items || []).filter((item) =>
          item.label.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [options, search]);

  // Estilos baseados na variante
  const isGhost = variant === "ghost";

  return (
    <div ref={ref} className="relative w-full font-mono">
      <div
        onClick={() => setOpen(!open)}
        className={`
          w-full flex items-center justify-between cursor-pointer transition-all duration-200
          ${isGhost 
            ? "h-10 px-2 bg-transparent border-none" // Estilo para dentro do Rack
            : "h-11 px-4 bg-[#0a0a0a] border border-white/5 rounded-xl hover:border-white/10" // Estilo Card Padrão
          }
          ${open && !isGhost ? "border-sky-500/50 bg-[#0f0f0f]" : ""}
        `}
      >
        <span className={`
          text-[10px] font-bold uppercase tracking-tight truncate mr-2
          ${selectedItem ? "text-zinc-100" : "text-zinc-600"}
          ${isGhost ? "text-[10px]" : "text-[11px]"}
        `}>
          {selectedItem ? (renderValue ? renderValue(selectedItem) : selectedItem.label) : placeholder}
        </span>
        
        <ChevronDown 
          size={isGhost ? 12 : 14} 
          className={`shrink-0 text-zinc-600 transition-transform ${open ? "rotate-180 text-sky-500" : ""}`} 
        />
      </div>

      {open && (
        <div className={`
          absolute left-0 w-full bg-[#0c0c0e] border border-white/10 rounded-xl shadow-2xl overflow-hidden
          ${zIndex}
          ${isGhost ? "top-[calc(100%+2px)] min-w-[200px]" : "top-[calc(100%+6px)]"}
        `}>
          {searchable && (
            <div className="p-2 border-b border-white/5 bg-black/20">
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="BUSCAR..."
                className="w-full h-8 bg-black border border-white/5 px-3 text-[10px] text-zinc-300 outline-none focus:border-sky-500/40 font-bold"
              />
            </div>
          )}
          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {filteredOptions.length > 0 ? filteredOptions.map((group, gi) => (
              <div key={gi} className="mb-2 last:mb-0">
                {group.group && <div className="px-3 py-1 text-[8px] font-black text-zinc-600 uppercase tracking-widest">{group.group}</div>}
                {group.items.map((item) => (
                  <div
                    key={item.value}
                    onClick={() => { onChange(item.value); setOpen(false); }}
                    className={`px-3 py-2 rounded-lg flex items-center justify-between text-[10px] font-bold uppercase cursor-pointer
                      ${String(value) === String(item.value) ? "bg-sky-500/10 text-sky-400" : "text-zinc-400 hover:bg-white/5"}`}
                  >
                    <span className="truncate">{item.label}</span>
                    {String(value) === String(item.value) && <Check size={12} className="shrink-0 ml-2" />}
                  </div>
                ))}
              </div>
            )) : (
                <div className="p-4 text-center text-[9px] font-black text-zinc-700 uppercase tracking-widest">Zero_Results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
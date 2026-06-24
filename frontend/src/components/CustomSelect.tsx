import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";

export interface Option {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder: string;
  name?: string;
  direction?: "up" | "down";
  triggerClassName?: string;
  wrapperClassName?: string;
  menuClassName?: string;
}

export function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  name, 
  direction = "down", 
  triggerClassName = "", 
  wrapperClassName = "relative flex-1",
  menuClassName = "left-0 w-full"
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className={wrapperClassName} ref={ref}>
      {name && <input type="hidden" name={name} value={value} />}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between text-left gap-1 outline-none cursor-pointer ${triggerClassName}`}
      >
        <span className="truncate flex-1">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={14} className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--accent-main)]' : 'text-stone-400'}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: direction === "up" ? 10 : -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: direction === "up" ? 10 : -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${direction === "up" ? "bottom-full mb-4 origin-bottom" : "top-full mt-2 origin-top"} ${menuClassName} bg-[var(--surface-panel)] dark:bg-[var(--surface-panel)] border border-[var(--border-soft)] dark:border-[var(--border-soft)] rounded-xl shadow-2xl overflow-hidden z-[100]`}
          >
            <div className="p-1 max-h-60 overflow-y-auto">
              <button 
                type="button"
                onClick={() => { onChange(""); setIsOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors hover:bg-[var(--surface-panel-muted)] dark:hover:bg-[var(--surface-panel-muted)] focus:bg-[var(--surface-panel-muted)] dark:focus:bg-[var(--surface-panel-muted)] outline-none ${value === "" ? "text-[var(--accent-main)] font-bold bg-[var(--accent-main)]/10" : "text-[var(--text-muted)] dark:text-[var(--text-muted)]"}`}
              >
                {placeholder}
              </button>
              {options.map(opt => (
                <button 
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setIsOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors hover:bg-[var(--surface-panel-muted)] dark:hover:bg-[var(--surface-panel-muted)] focus:bg-[var(--surface-panel-muted)] dark:focus:bg-[var(--surface-panel-muted)] outline-none ${value === opt.value ? "text-[var(--accent-main)] font-bold bg-[var(--accent-main)]/10" : "text-[var(--text-muted)] dark:text-[var(--text-muted)]"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


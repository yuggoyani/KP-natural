"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  id?: string;
  label: string;
  placeholder?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export function SearchableSelect({
  id,
  label,
  placeholder = "Select an option",
  options,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="w-full flex flex-col items-start text-left relative" ref={containerRef}>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-brand-text-primary mb-1.5 flex items-center gap-1">
        <span>{label}</span>
        {required && <span className="text-rose-600 font-bold">*</span>}
      </label>

      {/* Select Box Trigger */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearch("");
          }
        }}
        className={cn(
          "w-full h-12 px-4 rounded-farm bg-[#FCF9F2] border text-left text-sm flex items-center justify-between transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green",
          error
            ? "border-rose-500 ring-1 ring-rose-500/30"
            : "border-brand-border hover:border-brand-green/50",
          disabled && "opacity-50 cursor-not-allowed bg-brand-ivory-300"
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selectedOption ? "text-brand-text-primary font-medium" : "text-brand-text-muted"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-brand-text-muted transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {/* Inline Validation Error */}
      {error && <span className="text-xs text-rose-600 font-medium mt-1">{error}</span>}

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-[#FCF9F2] border border-brand-border rounded-farm-lg shadow-elevated overflow-hidden animate-fade-in max-h-64 flex flex-col">
          {/* Search Input Box */}
          <div className="p-2 border-b border-brand-border/60 bg-white">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-brand-ivory-300/60 border border-brand-border/50">
              <Search className="w-4 h-4 text-brand-text-muted shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full text-xs bg-transparent focus:outline-none text-brand-text-primary"
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto flex-1 p-1" role="listbox">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "px-3 py-2 rounded text-xs sm:text-sm flex items-center justify-between cursor-pointer transition-colors",
                      isSelected
                        ? "bg-brand-green-50 text-brand-green font-semibold"
                        : "hover:bg-brand-ivory-300/80 text-brand-text-primary"
                    )}
                  >
                    <div className="flex flex-col">
                      <span>{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-[10px] text-brand-text-muted">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-brand-green shrink-0" />}
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-brand-text-muted">
                No matching options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

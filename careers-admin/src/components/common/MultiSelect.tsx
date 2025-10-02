import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type MultiOption = { label: string; value: string };

type MultiSelectProps = {
  values: string[];
  onChange: (values: string[]) => void;
  options: MultiOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  searchable?: boolean;
};

const MultiSelect: React.FC<MultiSelectProps> = ({
  values,
  onChange,
  options,
  placeholder = 'Select...',
  className,
  disabled,
  ariaLabel = 'Multi select',
  searchable = false,
}) => {
  const [open, setOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [query, setQuery] = useState('');
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const closeWithAnimation = () => {
    setExiting(true);
    setTimeout(() => {
      setOpen(false);
      setExiting(false);
    }, 130);
  };

  const toggleValue = useCallback(
    (v: string) => {
      const set = new Set(values);
      if (set.has(v)) set.delete(v);
      else set.add(v);
      onChange(Array.from(set));
    },
    [values, onChange]
  );

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter(o => o.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (
        e.target instanceof Node &&
        !menuRef.current.contains(e.target) &&
        !btnRef.current?.contains(e.target as Node)
      ) {
        closeWithAnimation();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeWithAnimation();
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => {
          const next = i < filtered.length - 1 ? i + 1 : 0;
          return next;
        });
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => {
          const prev = i > 0 ? i - 1 : filtered.length - 1;
          return prev;
        });
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filtered.length) {
          const v = filtered[activeIndex]?.value;
          toggleValue(v);
        }
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, activeIndex, toggleValue, filtered]);

  useEffect(() => {
    if (open) {
      setActiveIndex(0);
      setQuery('');
    }
  }, [open]);

  const selectedOptions = useMemo(() => {
    const set = new Set(values);
    return options.filter((o) => set.has(o.value));
  }, [values, options]);

  const removeTag = (v: string) => {
    const set = new Set(values);
    set.delete(v);
    onChange(Array.from(set));
  };

  return (
    <div className={`relative ${className ?? ''}`}>
      <style>{`
        @keyframes mslc-in { from { opacity: 0; transform: scale(0.97) } to { opacity: 1; transform: scale(1) } }
        @keyframes mslc-out { from { opacity: 1; transform: scale(1) } to { opacity: 0; transform: scale(0.98) } }
        .mslc-enter { animation: mslc-in 120ms ease-out; transform-origin: top left; }
        .mslc-exit { animation: mslc-out 100ms ease-in; transform-origin: top left; }
      `}</style>

      <button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={!!disabled}
        onClick={() => {
          if (disabled) return;
          if (open) closeWithAnimation();
          else setOpen(true);
        }}
        className={`w-full min-h-[40px] p-2 bg-white border border-gray-300 rounded-md text-left text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 flex flex-wrap gap-2 ${
          open ? 'ring-2 ring-blue-500 border-blue-500' : ''
        }`}
     >
        {selectedOptions.length === 0 ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          selectedOptions.map((opt) => (
            <span
              key={opt.value}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs"
            >
              {opt.label}
              <button
                type="button"
                className="ml-1 text-blue-500 hover:text-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(opt.value);
                }}
                aria-label={`Remove ${opt.label}`}
              >
                ×
              </button>
            </span>
          ))
        )}
        <span className="ml-auto inline-flex items-center">
          <svg className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 12a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 9.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 12z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>

      {(open || exiting) && (
        <div
          ref={menuRef}
          className={`${open ? 'mslc-enter' : 'mslc-exit'} absolute mt-1 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20`}
          role="listbox"
        >
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                aria-label="Search options"
              />
            </div>
          )}
          <div className="max-h-60 overflow-auto py-1">
            {filtered.map((opt, idx) => {
              const checked = values.includes(opt.value);
              const active = idx === activeIndex;
              return (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 px-4 py-2 text-sm cursor-pointer ${
                    active ? 'bg-gray-50' : ''
                  }`}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    checked={checked}
                    onChange={() => toggleValue(opt.value)}
                  />
                  <span className={checked ? 'text-blue-700' : 'text-gray-700'}>{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;

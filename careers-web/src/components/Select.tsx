import React, { useEffect, useMemo, useRef, useState } from 'react';

export type SelectOption = { 
  label: string; 
  value: string;
  highlighted?: boolean;
  highlightColor?: string;
};

type SelectProps = {
  value?: string;
  onChange: (value: string | undefined) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  allowEmpty?: boolean;
  searchable?: boolean;
  popUpward?: boolean;
};

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  className,
  disabled,
  ariaLabel = 'Select',
  allowEmpty = false,
  searchable = false,
  popUpward = false,
}) => {
  const [open, setOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [query, setQuery] = useState('');
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const currentIndex = useMemo(
    () => options.findIndex((o) => o.value === value),
    [options, value]
  );

  const closeWithAnimation = () => {
    setExiting(true);
    setTimeout(() => {
      setOpen(false);
      setExiting(false);
    }, 130);
  };

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
          const next = i < options.length - 1 ? i + 1 : 0;
          return next;
        });
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => {
          const prev = i > 0 ? i - 1 : options.length - 1;
          return prev;
        });
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < options.length) {
          onChange(options[activeIndex]?.value);
          closeWithAnimation();
        }
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, activeIndex, options, onChange]);

  useEffect(() => {
    if (open) {
      setActiveIndex(currentIndex >= 0 ? currentIndex : 0);
      setQuery('');
    }
  }, [open, currentIndex]);

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => o.value === value);
    return found?.label ?? (allowEmpty && !value ? placeholder : value ?? placeholder);
  }, [options, value, placeholder, allowEmpty]);

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter(o => o.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  return (
    <div className={`relative inline-block text-left w-full ${className ?? ''}`}>
      <style>{`
        @keyframes slc-in { from { opacity: 0; transform: scale(0.97) } to { opacity: 1; transform: scale(1) } }
        @keyframes slc-out { from { opacity: 1; transform: scale(1) } to { opacity: 0; transform: scale(0.98) } }
        .slc-enter { animation: slc-in 120ms ease-out; transform-origin: top left; }
        .slc-exit { animation: slc-out 100ms ease-in; transform-origin: top left; }
        .slc-item[aria-selected="true"] { background-color: rgba(168, 85, 247, 0.1); }
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
        className={`block w-full pl-3 pr-10 py-3 px-4 bg-gray-50 border border-gray-300 rounded-xl text-left text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 min-h-[48px] transition-all ${
          open ? 'ring-2 ring-purple-500 border-transparent' : ''
        }`}
      >
        <span className={`truncate block ${!value && allowEmpty ? 'text-gray-500' : 'text-gray-900'}`}>
          {selectedLabel}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg
            className="h-4 w-4 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
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
          className={`${open ? 'slc-enter' : 'slc-exit'} absolute ${popUpward ? 'bottom-full mb-1' : 'mt-1'} w-full rounded-xl shadow-lg bg-white border border-gray-200 ring-1 ring-gray-200 ring-opacity-5 z-20`}
          role="listbox"
        >
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                aria-label="Search options"
              />
            </div>
          )}
          <div className="max-h-60 overflow-auto py-1">
            {allowEmpty && (
              <button
                type="button"
                role="option"
                aria-selected={!value}
                className={`slc-item block w-full text-left px-4 py-2 text-sm ${
                  !value ? 'text-purple-600' : 'text-gray-700'
                } hover:bg-gray-50`}
                onMouseEnter={() => setActiveIndex(-1)}
                onClick={() => {
                  onChange(undefined);
                  closeWithAnimation();
                }}
              >
                {placeholder}
              </button>
            )}
            {filtered.map((opt, idx) => {
              const isHovered = idx === activeIndex;
              const isSelected = opt.value === value;
              const isHighlighted = opt.highlighted;
              
              let bgColor = 'transparent';
              let textColor = '#374151';
              
              if (isHighlighted) {
                bgColor = isHovered ? 'rgba(168, 85, 247, 0.15)' : (opt.highlightColor || 'rgba(168, 85, 247, 0.08)');
                textColor = '#7c3aed';
              } else if (isHovered) {
                bgColor = 'rgba(243, 244, 246, 1)';
                textColor = isSelected ? '#7c3aed' : '#111827';
              } else if (isSelected) {
                textColor = '#7c3aed';
              }
              
              const fontWeight = isHighlighted ? '600' : 'normal';
              
              return (
                <button
                  type="button"
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  className="slc-item block w-full text-left px-4 py-2 text-sm transition-colors"
                  style={{
                    backgroundColor: bgColor,
                    color: textColor,
                    fontWeight: fontWeight,
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => {
                    onChange(opt.value);
                    closeWithAnimation();
                  }}
                >
                  {isHighlighted && '🟢 '}{opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;

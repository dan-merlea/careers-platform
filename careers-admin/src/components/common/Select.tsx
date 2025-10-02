import React, { useEffect, useMemo, useRef, useState } from 'react';

export type SelectOption = { label: string; value: string };

type SelectProps = {
  value?: string;
  onChange: (value: string | undefined) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
  allowEmpty?: boolean;
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
}) => {
  const [open, setOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
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
    }
  }, [open, currentIndex]);

  const selectedLabel = useMemo(() => {
    const found = options.find((o) => o.value === value);
    return found?.label ?? (allowEmpty && !value ? placeholder : value ?? placeholder);
  }, [options, value, placeholder, allowEmpty]);

  return (
    <div className={`relative inline-block text-left ${className ?? ''}`}>
      <style>{`
        @keyframes slc-in { from { opacity: 0; transform: scale(0.97) } to { opacity: 1; transform: scale(1) } }
        @keyframes slc-out { from { opacity: 1; transform: scale(1) } to { opacity: 0; transform: scale(0.98) } }
        .slc-enter { animation: slc-in 120ms ease-out; transform-origin: top left; }
        .slc-exit { animation: slc-out 100ms ease-in; transform-origin: top left; }
        .slc-item[aria-selected="true"] { background-color: #eff6ff; }
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
        className={`block w-28 pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md text-left text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
          open ? 'ring-2 ring-blue-500 border-blue-500' : ''
        }`}
      >
        <span className={`truncate ${!value && allowEmpty ? 'text-gray-400' : 'text-gray-900'}`}>
          {selectedLabel}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg
            className="h-4 w-4 text-gray-500"
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
          className={`${open ? 'slc-enter' : 'slc-exit'} absolute mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20`}
          role="listbox"
        >
          <div className="max-h-60 overflow-auto py-1">
            {allowEmpty && (
              <button
                type="button"
                role="option"
                aria-selected={!value}
                className={`slc-item block w-full text-left px-4 py-2 text-sm ${
                  !value ? 'text-blue-700' : 'text-gray-700'
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
            {options.map((opt, idx) => (
              <button
                type="button"
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                className={`slc-item block w-full text-left px-4 py-2 text-sm ${
                  opt.value === value ? 'text-blue-700' : 'text-gray-700'
                } hover:bg-gray-50 ${idx === activeIndex ? 'bg-gray-50' : ''}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => {
                  onChange(opt.value);
                  closeWithAnimation();
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Select;

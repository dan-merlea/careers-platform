import React, { useEffect, useRef, useState } from 'react';

export type KebabItem = {
  label: string;
  onSelect: () => void | Promise<void>;
  disabled?: boolean;
};

type KebabMenuProps = {
  items: KebabItem[];
  ariaLabel?: string;
  align?: 'right' | 'left';
  triggerClassName?: string;
};

const KebabMenu: React.FC<KebabMenuProps> = ({
  items,
  ariaLabel = 'Open actions menu',
  align = 'right',
  triggerClassName,
}) => {
  const [open, setOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

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
        e.stopPropagation();
        closeWithAnimation();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative inline-block text-left">
      {/* Local animation styles */}
      <style>{`
        @keyframes kb-scale-in { from { opacity: 0; transform: scale(0.95) } to { opacity: 1; transform: scale(1) } }
        @keyframes kb-scale-out { from { opacity: 1; transform: scale(1) } to { opacity: 0; transform: scale(0.98) } }
        .kb-enter { animation: kb-scale-in 120ms ease-out; transform-origin: top ${align}; }
        .kb-exit { animation: kb-scale-out 100ms ease-in; transform-origin: top ${align}; }
      `}</style>

      <button
        ref={btnRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => {
          if (open) {
            closeWithAnimation();
          } else {
            setOpen(true);
          }
        }}
        className={
          triggerClassName ||
          'inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        }
      >
        {/* Horizontal dots icon */}
        <svg
          className="w-5 h-5 text-gray-600"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M7.5 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm6 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
      </button>

      {(open || exiting) && (
        <div
          ref={menuRef}
          className={`${open ? 'kb-enter' : 'kb-exit'} origin-top-${align} absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10`}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1 flex flex-col" role="none">
            {items.map((item, idx) => (
              <button
                key={idx}
                type="button"
                disabled={item.disabled}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                  item.disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700'
                }`}
                role="menuitem"
                onClick={async () => {
                  try {
                    await item.onSelect();
                  } finally {
                    closeWithAnimation();
                  }
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KebabMenu;

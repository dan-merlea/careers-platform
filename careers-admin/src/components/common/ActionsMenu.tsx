import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export type ActionsMenuItem = {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'danger' | 'success';
  disabled?: boolean;
};

interface ActionsMenuProps {
  items: ActionsMenuItem[];
  menuWidthPx?: number; // default 192 (w-48)
  align?: 'right' | 'left';
  buttonClassName?: string;
  buttonAriaLabel?: string;
  buttonColor?: string;
}

const ActionsMenu: React.FC<ActionsMenuProps> = ({
  items,
  menuWidthPx = 192,
  align = 'right',
  buttonClassName = 'inline-flex items-center p-2 rounded-3xl bg-white/30 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500',
  buttonAriaLabel = 'Actions',
  buttonColor = 'text-gray-600',
}) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const openMenu = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const left = align === 'right' ? r.right + window.scrollX - menuWidthPx : r.left + window.scrollX;
    setPos({ top: r.bottom + window.scrollY + 4, left });
    setOpen(true);
  };

  const closeMenu = () => {
    setOpen(false);
    setPos(null);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || btnRef.current?.contains(target)) return;
      closeMenu();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const getItemClasses = (variant?: ActionsMenuItem['variant'], disabled?: boolean) => {
    const base = 'w-full text-left flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50';
    if (disabled) return `${base} text-gray-300 cursor-not-allowed`;
    if (variant === 'danger') return `${base} text-red-600 hover:bg-red-50`;
    if (variant === 'success') return `${base} text-green-700 hover:bg-green-50`;
    return `${base} text-gray-700`;
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={buttonAriaLabel}
        onClick={() => (open ? closeMenu() : openMenu())}
        className={buttonClassName}
      >
        <EllipsisHorizontalIcon className={`w-6 h-6 ${buttonColor}`} />
      </button>
      {open && pos && (
        <div
          ref={menuRef}
          className="fixed bg-white border border-gray-200 rounded-md shadow-lg z-[1000]"
          role="menu"
          style={{ top: pos.top, left: pos.left, width: menuWidthPx }}
        >
          <div className="py-1">
            {items.map((it, idx) => {
              if (it.href) {
                return (
                  <Link
                    key={idx}
                    to={it.href}
                    role="menuitem"
                    className={getItemClasses(it.variant, it.disabled)}
                    onClick={() => {
                      if (it.disabled) return;
                      closeMenu();
                    }}
                  >
                    {it.icon}
                    {it.label}
                  </Link>
                );
              }
              return (
                <button
                  key={idx}
                  type="button"
                  role="menuitem"
                  className={getItemClasses(it.variant, it.disabled)}
                  onClick={() => {
                    if (it.disabled) return;
                    it.onClick?.();
                    closeMenu();
                  }}
                >
                  {it.icon}
                  {it.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default ActionsMenu;

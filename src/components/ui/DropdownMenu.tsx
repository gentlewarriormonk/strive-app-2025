'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface DropdownMenuItem {
  label: string;
  icon?: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  trigger?: React.ReactNode;
}

export function DropdownMenu({ items, trigger }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 160;

      // Position menu below and to the left of the trigger
      let left = rect.right - menuWidth;
      let top = rect.bottom + 4;

      // Ensure menu doesn't go off-screen
      if (left < 8) left = 8;
      if (left + menuWidth > window.innerWidth - 8) {
        left = window.innerWidth - menuWidth - 8;
      }

      // If menu would go below viewport, show above
      const menuHeight = items.length * 40 + 8; // Approximate height
      if (top + menuHeight > window.innerHeight - 8) {
        top = rect.top - menuHeight - 4;
      }

      setPosition({ top, left });
    }
  }, [items.length]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, updatePosition]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleItemClick = (onClick: () => void) => {
    setIsOpen(false);
    onClick();
  };

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 flex items-center justify-center rounded-full text-[#92c0c9] hover:bg-white/10 hover:text-white transition-colors"
        aria-label="More options"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {trigger || <span className="material-symbols-outlined !text-lg">more_vert</span>}
      </button>

      {isOpen &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[100]"
              onClick={() => setIsOpen(false)}
            />
            {/* Menu */}
            <div
              ref={menuRef}
              role="menu"
              className="fixed z-[101] bg-[#1a2f33] border border-white/10 rounded-lg shadow-xl py-1 min-w-[160px] animate-fade-in"
              style={{
                top: position.top,
                left: position.left,
              }}
            >
              {items.map((item, index) => (
                <button
                  key={index}
                  role="menuitem"
                  onClick={() => handleItemClick(item.onClick)}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 flex items-center gap-3 transition-colors ${
                    item.variant === 'danger' ? 'text-red-400' : 'text-white'
                  }`}
                >
                  {item.icon && (
                    <span className="material-symbols-outlined !text-lg">{item.icon}</span>
                  )}
                  {item.label}
                </button>
              ))}
            </div>
          </>,
          document.body
        )}
    </>
  );
}

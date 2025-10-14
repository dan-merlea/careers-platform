'use client';

import { useEffect, useRef, useState } from 'react';

export type SliderItem = {
  id: string;
  label?: string;
  icon?: React.ReactNode;
};

type CategorySliderProps = {
  items: SliderItem[];
  activeIndex: number;
  onItemClick: (index: number) => void;
  className?: string;
  itemClassName?: string;
};

export default function CategorySlider({
  items,
  activeIndex,
  onItemClick,
  className = '',
  itemClassName = '',
}: CategorySliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const updateSliderPosition = () => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const buttons = Array.from(container.children).filter(
          (child) => child.tagName === 'BUTTON'
        );
        const button = buttons[activeIndex] as HTMLElement;
        if (button) {
          setSliderPosition({
            left: button.offsetLeft,
            width: button.offsetWidth,
          });
        }
      }
    };

    const timeoutId = setTimeout(updateSliderPosition, 0);
    window.addEventListener('resize', updateSliderPosition);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateSliderPosition);
    };
  }, [activeIndex]);

  useEffect(() => {
    // Scroll the selected button into view (centered)
    if (scrollRef.current) {
      const container = scrollRef.current;
      const buttons = Array.from(container.children).filter(
        (child) => child.tagName === 'BUTTON'
      );
      const button = buttons[activeIndex] as HTMLElement;
      if (button) {
        const containerWidth = container.offsetWidth;
        const buttonLeft = button.offsetLeft;
        const buttonWidth = button.offsetWidth;
        const scrollLeft = buttonLeft - containerWidth / 2 + buttonWidth / 2;

        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        });
      }
    }
  }, [activeIndex]);

  return (
    <div className={`relative w-full md:w-auto ${className}`}>
      <div
        ref={scrollRef}
        className="relative flex gap-2 p-1 rounded-full overflow-x-auto scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)',
        }}
      >
      {/* Animated Background - Liquid Glass Effect */}
      <div
        className="absolute h-[calc(100%-8px)] rounded-full transition-all duration-300 ease-out pointer-events-none top-[4px]"
        style={{
          left: `${sliderPosition.left}px`,
          width: `${sliderPosition.width}px`,
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
          backdropFilter: 'blur(10px) saturate(200%)',
          WebkitBackdropFilter: 'blur(10px) saturate(200%)',
          boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 1), 0 0 0 1px rgba(255, 255, 255, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        }}
      />
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          const showLabel = item.icon && item.label && isActive;
          
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(index)}
              className={`relative z-10 flex-shrink-0 flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-300 group/item ${
                isActive
                  ? 'text-gray-900 px-6 py-3'
                  : 'text-gray-600 hover:text-gray-900 px-6 py-3'
              } ${itemClassName}`}
              title={item.label}
            >
              {item.icon && <span className="flex items-center flex-shrink-0">{item.icon}</span>}
              {item.label && !item.icon && <span>{item.label}</span>}
              {showLabel && (
                <span className="whitespace-nowrap overflow-hidden transition-all duration-400">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

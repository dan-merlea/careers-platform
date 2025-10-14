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
    <div
      ref={scrollRef}
      className={`relative flex gap-2 p-0.5 bg-gray-100 rounded-full border border-gray-300 overflow-x-auto scrollbar-hide justify-center ${className}`}
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {/* Animated Background */}
      <div
        className="absolute h-[calc(100%-4px)] rounded-full transition-all duration-300 ease-out pointer-events-none top-[2px]"
        style={{
          left: `${sliderPosition.left}px`,
          width: `${sliderPosition.width}px`,
          background:
            'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.25), rgba(71, 71, 71, 0.08) 70%)',
          boxShadow: 'rgb(255 255 255 / 10%) 0px 2px 8px',
        }}
      />
      {items.map((item, index) => (
        <button
          key={item.id}
          onClick={() => onItemClick(index)}
          className={`relative z-10 flex-shrink-0 flex items-center justify-center px-6 py-3 rounded-full text-sm font-medium transition-colors duration-300 ${
            activeIndex === index
              ? 'text-gray-900'
              : 'text-gray-600 hover:text-gray-900'
          } ${itemClassName}`}
        >
          {item.icon && <span className="flex items-center">{item.icon}</span>}
          {item.label && <span>{item.label}</span>}
        </button>
      ))}
    </div>
  );
}

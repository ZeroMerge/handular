import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from './icons';

export interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  buttonHeightClass?: string;
  roundedClass?: string;
  icon?: React.ReactNode;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className = '',
  buttonHeightClass = 'h-10',
  roundedClass = 'rounded-[6px]',
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button - Zero borders, zero shadows, pure tactile squircle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full ${buttonHeightClass} px-3 ${roundedClass} bg-[#eceae2] hover:bg-[#e4e1d7] focus:bg-white text-xs sm:text-sm text-[#10393b] flex items-center justify-between transition-all outline-none focus:ring-2 focus:ring-[#30c5ce]/30 cursor-pointer select-none`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-[#777777] shrink-0">{icon}</span>}
          <span className={`truncate font-normal ${!selectedOption ? 'text-[#888888]' : 'text-[#10393b]'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDownIcon
          className={`w-3.5 h-3.5 text-[#777777] transition-transform duration-200 shrink-0 ml-1.5 ${
            isOpen ? 'rotate-180 text-[#10393b]' : ''
          }`}
        />
      </button>

      {/* Popover Menu - WhatsApp morph, zero shadows, tonal separation */}
      {isOpen && (
        <div className={`absolute left-0 right-0 top-full mt-1.5 z-50 bg-white ${roundedClass} p-1 max-h-60 overflow-y-auto no-scrollbar animate-chat-morph`}>
          <div className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 ${roundedClass} text-xs flex items-center justify-between transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-black/10 text-[#0f2d2e] font-medium'
                      : 'text-[#10393b]/80 hover:bg-[#eceae2] hover:text-[#10393b] font-normal'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <CheckIcon className="w-3.5 h-3.5 text-[#10393b] shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

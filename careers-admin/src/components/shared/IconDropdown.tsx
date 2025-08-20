import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Complete list of Bootstrap icons
const bootstrapIcons = [
  'alarm', 'archive', 'arrow-down', 'arrow-left', 'arrow-right', 'arrow-up', 'asterisk', 'award',
  'bag', 'bar-chart', 'basket', 'battery', 'bell', 'bicycle', 'binoculars', 'book', 'bookmark', 'box', 'briefcase', 'brush', 'bucket', 'building', 'bullseye', 'bus-front',
  'calculator', 'calendar', 'camera', 'cart', 'cash', 'chat', 'check', 'check-circle', 'check-square', 'chevron-down', 'chevron-left', 'chevron-right', 'chevron-up', 'circle', 'clipboard', 'clock', 'cloud', 'code', 'cup-hot', 'incognito', 'columns', 'compass', 'cpu', 'credit-card', 'crop', 'cup', 'cursor',
  'dash', 'database', 'diagram', 'diamond', 'display', 'document', 'door', 'download',
  'earbuds', 'easel', 'egg', 'eject', 'emoji', 'envelope', 'exclamation', 'exclamation-circle', 'eye',
  'facebook', 'file', 'film', 'filter', 'flag', 'folder', 'forward',
  'gear', 'gem', 'gift', 'github', 'globe', 'graph', 'grid', 'grip',
  'hammer', 'hand', 'hand-thumbs-down', 'hand-thumbs-up', 'handbag', 'hash', 'headphones', 'heart', 'house', 'hourglass',
  'image', 'inbox', 'info', 'info-circle', 'instagram',
  'journal', 'joystick',
  'key', 'keyboard',
  'lamp', 'laptop', 'layers', 'layout', 'lightning', 'lightbulb', 'link', 'linkedin', 'list', 'lock', 'luggage',
  'magic', 'magnet', 'mailbox', 'map', 'mask', 'megaphone', 'menu', 'mic', 'minecart', 'moon', 'mouse', 'music',
  'newspaper', 'nut',
  'palette', 'paperclip', 'pause', 'peace', 'pen', 'pencil', 'people', 'percent', 'person', 'phone', 'pie-chart', 'pin', 'pinterest', 'play', 'plug', 'plus', 'power', 'printer', 'puzzle', 'question', 'question-circle',
  'receipt', 'record', 'recycle', 'reply', 'robot', 'rocket', 'ruler',
  'safe', 'save', 'scissors', 'screwdriver', 'search', 'server', 'share', 'shield', 'shop', 'shuffle', 'signpost', 'sim', 'skip', 'slack', 'slash', 'sliders', 'smartphone', 'snapchat', 'snow', 'speaker', 'speedometer', 'spotify', 'square', 'stack', 'star', 'sticky', 'stop', 'stopwatch', 'subtract', 'suit', 'sun', 'sunglasses',
  'tablet', 'tag', 'telephone', 'terminal', 'thermometer', 'thumbs-down', 'thumbs-up', 'ticket', 'toggle', 'tools', 'trash', 'tree', 'trophy', 'truck', 'tv', 'twitch', 'twitter', 'type',
  'umbrella', 'unlock', 'upload', 'usb',
  'vector-pen', 'view', 'vinyl', 'voicemail', 'volume',
  'wallet', 'watch', 'water', 'webcam', 'whatsapp', 'wifi', 'window', 'wordpress', 'wrench',
  'x', 'x-circle', 'x-square',
  'youtube',
  'zoom-in', 'zoom-out'
];

interface IconDropdownProps {
  selectedIcon: string;
  onSelectIcon: (icon: string) => void;
}

const IconDropdown: React.FC<IconDropdownProps> = ({ selectedIcon, onSelectIcon }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div className="mb-2" ref={dropdownRef}>
      <label className="block text-gray-700 mb-1">Select an icon:</label>
      <div className="relative">
        {isDropdownOpen && (
          <div className="absolute z-10 bottom-full mb-1 w-full bg-slate-50 border rounded-md shadow-xl max-h-64 overflow-auto">
            <div className="sticky top-0 bg-slate-100 p-2 border-b">
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Search icons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoComplete="off"
              />
            </div>
            <div className="p-2">
              {bootstrapIcons
                .filter((icon: string) => icon.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((icon: string) => (
                  <div
                    key={icon}
                    className={`flex items-center p-2 hover:bg-gray-100 cursor-pointer ${selectedIcon === icon ? 'bg-blue-50' : ''}`}
                    onClick={() => {
                      onSelectIcon(icon);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <i className={`bi bi-${icon} mr-2`}></i>
                    <span>{icon}</span>
                  </div>
                ))}
              {bootstrapIcons.filter((icon: string) => icon.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <div className="p-2 text-gray-500">No icons found</div>
              )}
            </div>
          </div>
        )}
        
        <div 
          className="flex items-center border rounded p-2 cursor-pointer" 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {selectedIcon ? (
            <>
              <i className={`bi bi-${selectedIcon} mr-2`}></i>
              <span>{selectedIcon}</span>
            </>
          ) : (
            <span className="text-gray-500">Select an icon</span>
          )}
          <i className={`bi bi-chevron-${isDropdownOpen ? 'up' : 'down'} ml-auto`}></i>
        </div>
      </div>
    </div>
  );
};

export default IconDropdown;

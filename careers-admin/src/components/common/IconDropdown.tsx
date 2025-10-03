import React from 'react';
import Select from '../common/Select';
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
  const iconOptions = bootstrapIcons.map(icon => ({
    label: icon,
    value: icon
  }));

  return (
    <div className="min-w-36 mr-2">
      <Select
        value={selectedIcon || undefined}
        onChange={(val) => onSelectIcon(val || '')}
        options={iconOptions}
        searchable
        placeholder="Select icon"
        className="w-full"
        popUpward
      />
    </div>
  );
};

export default IconDropdown;

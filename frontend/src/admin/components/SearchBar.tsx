import { Search } from 'lucide-react';

interface AdminSearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

export default function AdminSearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  onKeyDown,
}: AdminSearchBarProps) {
  return (
    <div className={`input-with-icon ${className}`}>
      <Search size={16} className="input-icon" strokeWidth={2.25} aria-hidden />
      <input
        type="text"
        role="searchbox"
        inputMode="search"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="input-field text-sm"
      />
    </div>
  );
}

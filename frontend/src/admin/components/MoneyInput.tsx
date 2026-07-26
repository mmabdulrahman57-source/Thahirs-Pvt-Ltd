import { useEffect, useState } from 'react';
import { parseMoneyInput, sanitizeMoneyInput } from '../../types/quotation';

interface Props {
  value: number | undefined;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

function formatOnBlur(value: number) {
  if (value <= 0) return '';
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

/** Plain text money field — type amounts like 1500 or 1500.00 (no spinner arrows). */
export default function MoneyInput({
  value,
  onChange,
  placeholder = '0.00',
  className = 'input-field text-sm',
  id,
}: Props) {
  const [text, setText] = useState(() => formatOnBlur(value ?? 0));

  useEffect(() => {
    const num = value ?? 0;
    if (parseMoneyInput(text) !== num) {
      setText(formatOnBlur(num));
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder={placeholder}
      value={text}
      onChange={e => {
        const cleaned = sanitizeMoneyInput(e.target.value);
        setText(cleaned);
        onChange(parseMoneyInput(cleaned));
      }}
      onBlur={() => setText(formatOnBlur(parseMoneyInput(text)))}
      className={className}
    />
  );
}

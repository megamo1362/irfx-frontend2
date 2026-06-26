'use client';

import { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react';
import { cn } from '@/lib/utils';

export interface OtpInputProps {
  onComplete: (code: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function OtpInput({ onComplete, disabled, error }: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const refs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));

  const focus = (i: number) => refs.current[i]?.focus();

  const update = (newDigits: string[]) => {
    setDigits(newDigits);
    if (newDigits.every(d => d !== '')) {
      onComplete(newDigits.join(''));
    }
  };

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = digit;
    update(next);
    if (digit && i < 5) focus(i + 1);
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        const next = [...digits];
        next[i] = '';
        update(next);
      } else if (i > 0) {
        focus(i - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      focus(Math.max(0, i - 1));
    } else if (e.key === 'ArrowRight') {
      focus(Math.min(5, i + 1));
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill('');
    pasted.split('').forEach((d, idx) => { next[idx] = d; });
    update(next);
    focus(Math.min(pasted.length, 5));
  };

  const boxClass = cn(
    'w-10 h-12 text-center text-lg font-bold rounded-xl border transition-all',
    'bg-[rgba(6,13,28,0.6)] text-[var(--color-text-primary)] outline-none',
    'focus:border-[var(--color-cyan)] focus:shadow-[var(--shadow-focus)]',
    disabled && 'opacity-50 cursor-not-allowed',
    error
      ? 'border-[rgba(239,68,68,0.5)]'
      : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]',
  );

  return (
    <div className="flex gap-2 justify-center" dir="ltr">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={2}
          value={d}
          disabled={disabled}
          className={boxClass}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
        />
      ))}
    </div>
  );
}

import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="label">{label}</label>}
        <input
          ref={ref}
          className={clsx('input', error && 'input-error', className)}
          {...props}
        />
        {error && <p className="mt-1 text-caption text-accent-red">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

'use client';

import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white 
          transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 
          focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:bg-blue-800
          cursor-pointer aria-disabled:cursor-not-allowed aria-disabled:opacity-50
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };

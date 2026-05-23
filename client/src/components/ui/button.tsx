// src/components/ui/button.tsx
import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", size = "default", variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-xl font-semibold 
          transition-all focus-visible:outline-none focus-visible:ring-2 
          focus-visible:ring-blue-500 disabled:opacity-50 ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
// src/components/ui/card.tsx
import { forwardRef } from 'react';

const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-3xl border bg-white dark:bg-gray-900 shadow-sm ${className}`}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`p-6 ${className}`}
        {...props}
      />
    );
  }
);
CardContent.displayName = "CardContent";

export { Card, CardContent };
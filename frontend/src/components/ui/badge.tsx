import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:   'bg-gray-100 text-gray-700',
        primary:   'bg-primary-100 text-primary-700',
        success:   'bg-green-100 text-green-700',
        warning:   'bg-amber-100 text-amber-700',
        danger:    'bg-red-100 text-red-700',
        purple:    'bg-purple-100 text-purple-700',
        blue:      'bg-blue-100 text-blue-700',
        outline:   'border border-gray-200 text-gray-700',
        dot:       'bg-gray-100 text-gray-600 gap-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotColor?: string;
}

function Badge({ className, variant, dot, dotColor, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), dot && 'gap-1.5', className)} {...props}>
      {dot && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: dotColor }}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };

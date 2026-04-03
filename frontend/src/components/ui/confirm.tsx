import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { AlertTriangle } from 'lucide-react';
import { Button } from './button';
import { cn } from '../../lib/utils';

interface ConfirmProps {
  title: string;
  description?: string;
  onConfirm: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function Confirm({ title, description, onConfirm, children, disabled }: ConfirmProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        {children}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className={cn(
            'z-50 w-64 rounded-xl border border-gray-100 bg-white p-4 shadow-lg text-sm',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95'
          )}
          sideOffset={4}
        >
          <div className="flex gap-3 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 leading-tight">{title}</p>
              {description && <p className="text-gray-500 text-xs mt-1">{description}</p>}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => { onConfirm(); setOpen(false); }}
            >
              Delete
            </Button>
          </div>
          <PopoverPrimitive.Arrow className="fill-white" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

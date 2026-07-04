import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md border-2 border-foreground text-sm font-bold ' +
    'tracking-tight shadow-[4px_4px_0_0_hsl(var(--foreground))] transition-[transform,box-shadow,background-color,color,border-color] duration-150 ' +
    'hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_hsl(var(--foreground))] active:translate-x-1 active:translate-y-1 active:shadow-none dark:shadow-[4px_4px_0_0_hsl(var(--primary))] dark:hover:shadow-[6px_6px_0_0_hsl(var(--primary))] ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
    'disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:text-secondary-foreground',
        ghost:
          'border-transparent bg-transparent shadow-none hover:border-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-[4px_4px_0_0_hsl(var(--foreground))]',
        link: 'border-transparent bg-transparent text-primary shadow-none underline-offset-4 hover:translate-y-0 hover:shadow-none hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8 text-base',
        xl: 'h-12 rounded-lg px-10 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };

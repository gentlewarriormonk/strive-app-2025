import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#13c8ec] text-[#101f22] hover:bg-[#0ea5c7] font-bold',
  secondary: 'bg-white/10 text-white hover:bg-white/20 font-medium',
  ghost: 'bg-transparent text-white/80 hover:bg-white/10 hover:text-white font-medium',
  danger: 'bg-red-500/20 text-red-400 hover:bg-red-500/30 font-medium',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-base gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center
          rounded-lg
          transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {icon && iconPosition === 'left' && (
          <span className={`material-symbols-outlined ${size === 'sm' ? '!text-base' : '!text-xl'}`}>
            {icon}
          </span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className={`material-symbols-outlined ${size === 'sm' ? '!text-base' : '!text-xl'}`}>
            {icon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';




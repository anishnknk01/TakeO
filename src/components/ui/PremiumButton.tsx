/**
 * Premium Green Button Component
 * Consistent mirror-type green buttons across all pages
 */
'use client';

import { ReactNode } from 'react';

interface PremiumButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export default function PremiumButton({ 
  children, 
  onClick, 
  href,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button'
}: PremiumButtonProps) {
  const baseStyles = {
    fontFamily: 'SF Pro Display, -apple-system, system-ui, sans-serif',
    fontWeight: '600',
    borderRadius: '16px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: '1px solid transparent',
    textDecoration: 'none'
  };

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #34C759 0%, #30D158 100%)',
      color: '#FFFFFF',
      border: '1px solid rgba(52,199,89,0.3)',
      boxShadow: '0 8px 32px rgba(52,199,89,0.25)',
      ...(disabled ? {
        opacity: 0.5,
        background: '#9CA3AF',
        boxShadow: 'none'
      } : {})
    },
    secondary: {
      background: 'rgba(52,199,89,0.15)',
      color: '#34C759',
      border: '1px solid rgba(52,199,89,0.2)',
      boxShadow: '0 4px 16px rgba(52,199,89,0.1)',
      ...(disabled ? {
        opacity: 0.5,
        background: '#F3F4F6',
        color: '#9CA3AF',
        boxShadow: 'none'
      } : {})
    },
    outline: {
      background: 'transparent',
      color: '#34C759',
      border: '2px solid #34C759',
      boxShadow: 'none',
      ...(disabled ? {
        opacity: 0.5,
        color: '#9CA3AF',
        borderColor: '#9CA3AF'
      } : {})
    }
  };

  const sizes = {
    sm: {
      padding: '8px 16px',
      fontSize: '14px',
      minHeight: '36px'
    },
    md: {
      padding: '12px 24px',
      fontSize: '16px',
      minHeight: '44px'
    },
    lg: {
      padding: '16px 32px',
      fontSize: '18px',
      minHeight: '52px'
    }
  };

  const hoverStyles = !disabled ? {
    transform: 'scale(1.02) translateY(-2px)',
    boxShadow: variant === 'primary' 
      ? '0 12px 40px rgba(52,199,89,0.35)' 
      : variant === 'secondary'
      ? '0 8px 24px rgba(52,199,89,0.2)'
      : '0 4px 16px rgba(52,199,89,0.15)'
  } : {};

  const buttonStyle = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size]
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick();
    }
  };

  const resetStyles = {
    transform: 'scale(1) translateY(0)',
    boxShadow: (buttonStyle as any).boxShadow || 'none'
  };

  if (href && !disabled) {
    return (
      <a
        href={href}
        style={buttonStyle}
        className={`group ${className}`}
        onMouseEnter={(e) => {
          Object.assign(e.currentTarget.style, hoverStyles);
        }}
        onMouseLeave={(e) => {
          Object.assign(e.currentTarget.style, resetStyles);
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      style={buttonStyle}
      className={`group ${className}`}
      onMouseEnter={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, hoverStyles);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, resetStyles);
        }
      }}
    >
      {children}
    </button>
  );
}
import { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Componente Button customizado com variantes visuais consistentes.
 * Suporta acessibilidade com aria-label e estados de foco adequados.
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  ariaLabel?: string;
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  ariaLabel,
  ...props
}: ButtonProps) {
  // Classes base para todos os botões - acessibilidade e interações
  const base = 'px-6 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5D4037]/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  // Variantes visuais para diferentes contextos de uso
  const variants = {
    primary: 'bg-[#5D4037] text-[#FAF8F6] hover:bg-[#4E342E] shadow-sm',
    secondary: 'bg-transparent text-[#5D4037] border border-[#795548] hover:bg-[#F5F2F0]',
    ghost: 'text-[#795548] hover:bg-[#F5F2F0] hover:text-[#5D4037]',
    danger: 'bg-rose-50 text-rose-700 hover:bg-rose-100 focus-visible:ring-rose-500/40'
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
}

import { LucideIcon } from 'lucide-react';

/**
 * Componente para itens de navegação na sidebar.
 * Suporta estado ativo e acessibilidade com aria-current.
 */
export function SidebarItem({
  icon: Icon,
  label,
  active,
  onClick
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5D4037]/40 ${
        active
          ? 'bg-[#5D4037] text-white shadow-md'
          : 'text-[#795548] hover:bg-[#F5F2F0] hover:text-[#5D4037]'
      }`}
    >
      <Icon size={18} aria-hidden="true" />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

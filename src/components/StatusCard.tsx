import { STATUS_COLORS, PageStatus } from "@/types";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface StatusCardProps {
  title: string;
  value: number;
  status: PageStatus;
  icon: React.ComponentType<{ className?: string }>;
  onClear?: () => void;
  clearLabel?: string;
}

export default function StatusCard({ title, value, status, icon: Icon, onClear, clearLabel = "Limpar" }: StatusCardProps) {
  const colors = STATUS_COLORS[status];

  return (
    <div className="ds-card rounded-2xl p-6 transition-all duration-200 hover:scale-[1.02] cursor-default relative group ds-glow"
      style={{ background: `linear-gradient(135deg, ${colors.bg}, ${colors.bg}DD)` }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80" style={{ color: colors.text }}>{title}</p>
          <p className="text-4xl font-bold mt-1" style={{ color: colors.text }}>{value}</p>
        </div>
        <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
      {onClear && value > 0 && (
        <button onClick={(e) => { e.stopPropagation(); onClear(); }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium"
          style={{ backgroundColor: "rgba(255,255,255,0.2)", color: colors.text }}>
          <XMarkIcon className="w-3 h-3" />{clearLabel}
        </button>
      )}
    </div>
  );
}

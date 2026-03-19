import { TechnicalStandardList } from '../features/technical-standards/components/TechnicalStandardList';

export default function TechnicalStandardsPage() {
  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
          Hệ thống Tiêu chuẩn & Quy chuẩn
        </h1>
        <p className="text-[var(--color-text-muted)] font-medium max-w-2xl">
          Tra cứu, quản lý và áp dụng các tiêu chuẩn kỹ thuật (TCVN, ASTM, EUROCODE...) 
          đối với vật tư và biện pháp thi công trong toàn bộ dự án.
        </p>
      </div>

      <div className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] p-8 shadow-sm min-h-[600px]">
        <TechnicalStandardList />
      </div>
    </div>
  );
}

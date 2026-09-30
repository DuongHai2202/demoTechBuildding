import { TechnicalStandardList } from '../features/technical-standards/components/TechnicalStandardList';

export default function TechnicalStandardsPage() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-muted)]">
          <span>Quản lý dự án</span>
          <span aria-hidden="true">/</span>
          <span className="text-[var(--color-primary)]">Tiêu chuẩn kỹ thuật</span>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)] sm:text-3xl">
            Tiêu chuẩn kỹ thuật
          </h1>
          <p className="mt-1 max-w-3xl text-base leading-7 text-[var(--color-text-muted)]">
            Thư viện tập trung để tra cứu, quản lý phiên bản và áp dụng các tiêu chuẩn
            TCVN, ASTM, EUROCODE, IEC trong từng dự án.
          </p>
        </div>
      </div>

      <TechnicalStandardList />
    </div>
  );
}

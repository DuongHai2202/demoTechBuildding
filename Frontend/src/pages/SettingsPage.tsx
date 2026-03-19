import { useState } from 'react';
import {
  UserCircleIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  CheckIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../features/auth/stores/authStore';

type ThemeOption = 'light' | 'dark' | 'system';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [activeSection, setActiveSection] = useState<'profile' | 'appearance' | 'security' | 'notifications'>('profile');
  const [theme, setTheme] = useState<ThemeOption>(() => {
    return (localStorage.getItem('techbuildding-theme') as ThemeOption) || 'system';
  });

  const applyTheme = (t: ThemeOption) => {
    setTheme(t);
    localStorage.setItem('techbuildding-theme', t);
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
    } else if (t === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const sections = [
    { key: 'profile' as const, label: 'Hồ sơ cá nhân', icon: UserCircleIcon },
    { key: 'appearance' as const, label: 'Giao diện', icon: PaintBrushIcon },
    { key: 'security' as const, label: 'Bảo mật', icon: ShieldCheckIcon },
    { key: 'notifications' as const, label: 'Thông báo', icon: BellIcon },
  ];

  const themeOptions = [
    { key: 'light' as const, label: 'Sáng', icon: SunIcon, desc: 'Giao diện sáng truyền thống' },
    { key: 'dark' as const, label: 'Tối', icon: MoonIcon, desc: 'Giao diện tối bảo vệ mắt' },
    { key: 'system' as const, label: 'Hệ thống', icon: ComputerDesktopIcon, desc: 'Tự động theo thiết bị' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Cài đặt hệ thống</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Quản lý cấu hình ứng dụng, thông báo và bảo mật</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 space-y-1">
            {sections.map(s => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === s.key
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]'
                }`}
              >
                <s.icon className="h-5 w-5" />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Hồ sơ cá nhân</h2>
                <button className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
                  <PencilSquareIcon className="h-4 w-4" /> Chỉnh sửa
                </button>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-2xl font-bold text-[var(--color-primary)] border-4 border-[var(--color-border)]">
                  {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--color-text-primary)]">{user?.fullName || user?.username}</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">@{user?.username}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-[var(--color-success-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-success)]">
                      {user?.status || 'ACTIVE'}
                    </span>
                    {user?.roles?.map(r => (
                      <span key={r} className="inline-flex items-center rounded-full bg-[var(--color-info-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-info)]">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4 border-t border-[var(--color-border)]">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1 uppercase tracking-wide">Họ tên</label>
                  <p className="text-sm text-[var(--color-text-primary)]">{user?.fullName || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1 uppercase tracking-wide">Email</label>
                  <p className="text-sm text-[var(--color-text-primary)]">{user?.email || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1 uppercase tracking-wide">Số điện thoại</label>
                  <p className="text-sm text-[var(--color-text-primary)]">{user?.phone || '—'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1 uppercase tracking-wide">Ngày tạo</label>
                  <p className="text-sm text-[var(--color-text-primary)]">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Section */}
          {activeSection === 'appearance' && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-6">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Giao diện</h2>
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-4">Chế độ hiển thị</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {themeOptions.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => applyTheme(opt.key)}
                      className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all ${
                        theme === opt.key
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                          : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                      }`}
                    >
                      {theme === opt.key && (
                        <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
                          <CheckIcon className="h-3 w-3" strokeWidth={3} />
                        </div>
                      )}
                      <opt.icon className={`h-8 w-8 ${theme === opt.key ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`} />
                      <div className="text-center">
                        <p className="text-sm font-bold text-[var(--color-text-primary)]">{opt.label}</p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-6">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Bảo mật</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Mật khẩu hiện tại</label>
                  <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Mật khẩu mới</label>
                  <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Xác nhận mật khẩu mới</label>
                  <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]" />
                </div>
                <button className="rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-opacity">
                  Đổi mật khẩu
                </button>
              </div>
              <div className="pt-4 border-t border-[var(--color-border)]">
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">Phiên đăng nhập</h3>
                <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                  <div className="flex items-center gap-3">
                    <ComputerDesktopIcon className="h-8 w-8 text-[var(--color-text-muted)]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">Thiết bị hiện tại</p>
                      <p className="text-xs text-[var(--color-text-muted)]">Đang hoạt động</p>
                    </div>
                  </div>
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <NotificationsPanel />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Notifications Panel (extracted for state isolation) ─── */
interface NotifSetting {
  key: string;
  label: string;
  desc: string;
  category: 'email' | 'system' | 'reminder';
}

const NOTIF_SETTINGS: NotifSetting[] = [
  // Email
  { key: 'email_material_request', label: 'Yêu cầu vật tư mới', desc: 'Nhận email khi có yêu cầu xuất kho cần duyệt', category: 'email' },
  { key: 'email_attendance_alert', label: 'Chấm công bất thường', desc: 'Nhận email khi nhân viên chấm công ngoài phạm vi geofence', category: 'email' },
  { key: 'email_contract_signed', label: 'Hợp đồng mới ký kết', desc: 'Nhận email khi có hợp đồng mới được tạo hoặc ký', category: 'email' },
  { key: 'email_worklog_daily', label: 'Tổng hợp nhật ký hàng ngày', desc: 'Nhận email tóm tắt nhật ký thi công cuối ngày', category: 'email' },
  // System
  { key: 'sys_project_update', label: 'Cập nhật tiến độ dự án', desc: 'Thông báo khi trạng thái dự án thay đổi', category: 'system' },
  { key: 'sys_member_added', label: 'Thành viên mới', desc: 'Thông báo khi có nhân sự được thêm vào dự án của bạn', category: 'system' },
  { key: 'sys_material_approved', label: 'Vật tư được duyệt', desc: 'Thông báo khi yêu cầu vật tư đã được chấp thuận', category: 'system' },
  { key: 'sys_file_uploaded', label: 'Tài liệu mới', desc: 'Thông báo khi có tài liệu mới được tải lên dự án', category: 'system' },
  // Reminders
  { key: 'rem_contract_expiry', label: 'Hợp đồng sắp hết hạn', desc: 'Nhắc nhở trước 30 ngày khi hợp đồng gần đến hạn', category: 'reminder' },
  { key: 'rem_weekly_report', label: 'Báo cáo tuần', desc: 'Nhắc nhở gửi báo cáo tiến độ vào thứ 6 hàng tuần', category: 'reminder' },
  { key: 'rem_attendance_missing', label: 'Thiếu chấm công', desc: 'Nhắc nhở khi bạn chưa chấm công trong ngày', category: 'reminder' },
];

const CATEGORY_INFO: Record<string, { label: string; icon: string; desc: string }> = {
  email: { label: 'Email', icon: '📧', desc: 'Thông báo gửi qua email' },
  system: { label: 'Hệ thống', icon: '🔔', desc: 'Thông báo trong ứng dụng' },
  reminder: { label: 'Nhắc nhở', icon: '⏰', desc: 'Nhắc nhở tự động theo lịch' },
};

function NotificationsPanel() {
  const storageKey = 'techbuildding-notif-settings';

  const [settings, setSettings] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    // Defaults: enable all
    const defaults: Record<string, boolean> = {};
    NOTIF_SETTINGS.forEach(s => { defaults[s.key] = true; });
    return defaults;
  });

  const [saved, setSaved] = useState(false);

  const toggle = (key: string) => {
    setSettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
    setSaved(false);
  };

  const toggleCategory = (category: string) => {
    const keys = NOTIF_SETTINGS.filter(s => s.category === category).map(s => s.key);
    const allOn = keys.every(k => settings[k]);
    setSettings(prev => {
      const next = { ...prev };
      keys.forEach(k => { next[k] = !allOn; });
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(storageKey, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const enabledCount = Object.values(settings).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Cài đặt Thông báo</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--color-text-muted)]">
              {enabledCount}/{NOTIF_SETTINGS.length} đang bật
            </span>
            <button
              onClick={handleSave}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                saved
                  ? 'bg-[var(--color-success)] text-white'
                  : 'bg-[var(--color-primary)] text-white hover:opacity-90'
              }`}
            >
              {saved ? '✓ Đã lưu!' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">
          Tùy chỉnh cách bạn nhận thông báo từ hệ thống. Các thay đổi sẽ được áp dụng ngay lập tức.
        </p>
      </div>

      {/* Category Groups */}
      {['email', 'system', 'reminder'].map(cat => {
        const info = CATEGORY_INFO[cat];
        const items = NOTIF_SETTINGS.filter(s => s.category === cat);
        const allOn = items.every(s => settings[s.key]);
        const someOn = items.some(s => settings[s.key]);

        return (
          <div key={cat} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
            {/* Category Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[var(--color-surface-alt)]">
              <div className="flex items-center gap-3">
                <span className="text-lg">{info.icon}</span>
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)]">{info.label}</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">{info.desc}</p>
                </div>
              </div>
              <button
                onClick={() => toggleCategory(cat)}
                className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                  allOn
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                    : someOn
                      ? 'bg-amber-500/10 text-amber-600'
                      : 'bg-[var(--color-bg)] text-[var(--color-text-muted)]'
                }`}
              >
                {allOn ? 'Tắt tất cả' : 'Bật tất cả'}
              </button>
            </div>
            {/* Items */}
            <div className="divide-y divide-[var(--color-border)]">
              {items.map(item => (
                <div key={item.key} className="flex items-center justify-between px-6 py-4 hover:bg-[var(--color-bg)] transition-colors">
                  <div className="pr-4">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{item.label}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center shrink-0">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={settings[item.key] ?? true}
                      onChange={() => toggle(item.key)}
                    />
                    <div className="h-6 w-11 rounded-full bg-[var(--color-border)] peer-checked:bg-[var(--color-primary)] transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-5" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

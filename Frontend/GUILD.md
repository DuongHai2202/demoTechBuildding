# TechBuildding – Frontend React Architecture & Implementation Guide

> Tài liệu thiết kế kiến trúc và hướng dẫn triển khai Frontend (React + TypeScript) cho dự án TechBuildding.
> Mọi quy tắc viết code tuân thủ theo `React_Skill` guidelines.

---

## 1. Tech Stack

| Vai trò | Công nghệ | Lý do |
|---|---|---|
| Core | **React 18 + TypeScript** | Type-safe, Function Components only (React_Skill: `component-patterns`) |
| Build | **Vite** | Dev server nhanh, HMR tức thì (React_Skill: `tooling`) |
| Routing | **React Router v6** | Nested routes, Protected routes |
| Server State | **TanStack Query (React Query)** | Cache, refetch, mutation (React_Skill: `state-management`) |
| Client State | **Zustand** | Lightweight global store cho Auth/UI (React_Skill: `state-management`) |
| HTTP Client | **Axios** | Interceptor gắn token, refresh tự động |
| Forms | **React Hook Form + Zod** | Validate schema-based, typed (React_Skill: `typescript`) |
| UI | **Tailwind CSS + shadcn/ui** | Customizable, accessible components |
| Charts | **Recharts** | Dashboard biểu đồ |
| Maps | **React Leaflet** | Geofencing check-in/out |
| Testing | **Vitest + React Testing Library** | Test behavior, không test implementation (React_Skill: `testing`) |

---

## 2. Design System – Hệ Thống Thiết Kế

### 2.1. Bảng Màu Chủ Đạo (Primary Palette)

| Token | Mã màu | Mục đích sử dụng |
|---|---|---|
| `primary-50` | `#EFF6FF` | Nền nhạt (hover state, selected row) |
| `primary-100` | `#DBEAFE` | Badge background, active tab |
| `primary-200` | `#BFDBFE` | Border focus, outline |
| `primary-400` | `#60A5FA` | Link hover, secondary button |
| `primary-500` | `#3B82F6` | **Màu chính** – Logo, nút CTA, liên kết, sidebar active |
| `primary-600` | `#2563EB` | Nút CTA hover, tiêu đề quan trọng |
| `primary-700` | `#1D4ED8` | Nút CTA pressed / focus ring |

> 💡 **Xanh dương (Primary)** tượng trưng cho sự chuyên nghiệp, tin cậy – đặc trưng của ngành công nghệ & xây dựng.

### 2.2. Bảng Màu Nền & Chữ (Neutral Palette)

| Token | Mã màu | Mục đích sử dụng |
|---|---|---|
| `white` | `#FFFFFF` | Nền card, modal, form |
| `gray-50` | `#F9FAFB` | Nền trang chính (page background) |
| `gray-100` | `#F3F4F6` | Nền sidebar, table header, divider |
| `gray-200` | `#E5E7EB` | Border, separator |
| `gray-400` | `#9CA3AF` | Placeholder text, icon disabled |
| `gray-500` | `#6B7280` | Caption, metadata, secondary text |
| `gray-700` | `#374151` | Body text – nội dung bài viết |
| `gray-800` | `#1F2937` | Sub-heading |
| `gray-900` | `#111827` | Heading chính – tương phản cao, chống mỏi mắt |

### 2.3. Màu Sắc Bổ Trợ (Accents)

| Token | Mã màu | Mục đích sử dụng |
|---|---|---|
| `success-500` | `#22C55E` | Trạng thái thành công: ACTIVE, COMPLETED, Approved |
| `success-50` | `#F0FDF4` | Nền badge thành công |
| `warning-500` | `#F59E0B` | Cảnh báo, PENDING, Membership highlight |
| `warning-50` | `#FFFBEB` | Nền badge cảnh báo |
| `danger-500` | `#EF4444` | Lỗi, DELETE, SUSPENDED, Rejected |
| `danger-50` | `#FEF2F2` | Nền badge lỗi |
| `info-500` | `#06B6D4` | Thông tin, IN_PROGRESS, tooltip |
| `info-50` | `#ECFEFF` | Nền badge thông tin |

### 2.4. Cấu Hình Tailwind CSS (Dark Mode Ready)

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',   // Toggle dark mode bằng class .dark trên <html>
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        success: {
          50: '#F0FDF4',
          500: '#22C55E',
        },
        warning: {
          50: '#FFFBEB',
          500: '#F59E0B',
        },
        danger: {
          50: '#FEF2F2',
          500: '#EF4444',
        },
        info: {
          50: '#ECFEFF',
          500: '#06B6D4',
        },
        // Dark mode semantic colors
        dark: {
          bg:      '#0F172A',   // Slate-900 – nền trang chính
          surface: '#1E293B',   // Slate-800 – nền card, sidebar
          card:    '#334155',   // Slate-700 – nền card nổi, dropdown
          border:  '#475569',   // Slate-600 – border, divider
          muted:   '#64748B',   // Slate-500 – placeholder, icon disabled
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-dark': '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        dropdown: '0 4px 12px rgba(0, 0, 0, 0.1)',
        'dropdown-dark': '0 4px 12px rgba(0, 0, 0, 0.4)',
        modal: '0 20px 60px rgba(0, 0, 0, 0.15)',
        'modal-dark': '0 20px 60px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};

export default config;
```

### 2.5. Typography Scale

| Phần tử | Font | Size | Weight | Color |
|---|---|---|---|---|
| Page Title (h1) | Inter | `2rem` (32px) | 700 Bold | `gray-900` |
| Section Title (h2) | Inter | `1.5rem` (24px) | 600 Semi-bold | `gray-800` |
| Card Title (h3) | Inter | `1.125rem` (18px) | 600 Semi-bold | `gray-800` |
| Body | Inter | `0.875rem` (14px) | 400 Regular | `gray-700` |
| Caption / Metadata | Inter | `0.75rem` (12px) | 400 Regular | `gray-500` |
| Button | Inter | `0.875rem` (14px) | 500 Medium | `white` / `primary-600` |
| Code / Monospace | JetBrains Mono | `0.8125rem` (13px) | 400 Regular | `gray-700` |

### 2.6. Spacing & Layout Tokens

```text
Spacing:     4px | 8px | 12px | 16px | 24px | 32px | 48px | 64px
Card Padding:  24px
Page Padding:  24px – 32px
Sidebar Width: 256px (w-64)
Header Height: 64px (h-16)
Border Radius: 8px (default) | 12px (card) | 16px (modal)
```

### 2.7. Ví dụ Status Badge Component

```tsx
// src/components/StatusBadge.tsx

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info';

interface StatusBadgeProps {
  label: string;
  variant: BadgeVariant;
}

// Static map – hoisted ra ngoài component (React_Skill: performance)
const VARIANT_STYLES: Record<BadgeVariant, string> = {
  success: 'bg-success-50 text-success-500',
  warning: 'bg-warning-50 text-warning-500',
  danger:  'bg-danger-50 text-danger-500',
  info:    'bg-info-50 text-info-500',
};

export function StatusBadge({ label, variant }: StatusBadgeProps): JSX.Element {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANT_STYLES[variant]}`}>
      {label}
    </span>
  );
}
```

### 2.8. Phong Cách Thiết Kế (Design Philosophy)

> **Clean · Clarity-First · Modern Minimalism**

Giao diện TechBuildding tuân thủ 5 nguyên tắc cốt lõi:

1. **Tối giản có chủ đích (Purposeful Minimalism):** Loại bỏ mọi yếu tố thị giác không phục vụ chức năng. Mỗi thành phần UI đều có lý do tồn tại rõ ràng – không trang trí thừa, không hiệu ứng rối mắt.

2. **Ưu tiên sự rõ ràng (Clarity over Cleverness):** Thông tin trình bày trực diện, dễ quét bằng mắt (scannable). Sử dụng phân cấp thị giác (visual hierarchy) qua font-weight, kích cỡ và khoảng trắng thay vì dùng nhiều màu sắc gây nhiễu.

3. **Không gian thở (Generous Whitespace):** Card, bảng và form được bao bọc bởi padding rộng rãi (`24px`+), tạo cảm giác thoáng đãng giúp người dùng tập trung vào dữ liệu – đặc biệt quan trọng khi đọc nhật ký thi công và bảng chấm công dài.

4. **Phản hồi trạng thái tức thì (Instant Feedback):** Mọi tương tác (click, hover, submit) đều có phản hồi trực quan thông qua micro-transition (`150ms ease`), loading skeleton và toast notification – người dùng không bao giờ phải đoán "hệ thống đang làm gì".

5. **Nhất quán tuyệt đối (Absolute Consistency):** Một màu, một ý nghĩa. `primary-500` luôn là hành động chính. `danger-500` luôn là cảnh báo/xóa. `success-500` luôn là hoàn thành/duyệt. Không ngoại lệ.

### 2.9. Dark / Light Mode

#### Bảng Ánh Xạ Màu Light ↔ Dark

> Nguyên tắc: Dark mode **đảo ngược lớp nền** (nền sáng → nền tối) nhưng **giữ nguyên accent colors** ở mức sáng hơn một bậc để đảm bảo tương phản WCAG AA (≥ 4.5:1) trên nền tối.

| Vai trò | Light Mode | Dark Mode | Ghi chú |
|---|---|---|---|
| **Page Background** | `#F9FAFB` (gray-50) | `#0F172A` (slate-900) | Nền trang chính |
| **Card / Surface** | `#FFFFFF` (white) | `#1E293B` (slate-800) | Card, sidebar, modal |
| **Elevated Surface** | `#F3F4F6` (gray-100) | `#334155` (slate-700) | Dropdown, table header, popover |
| **Border / Divider** | `#E5E7EB` (gray-200) | `#475569` (slate-600) | Đường kẻ, viền |
| **Disabled / Muted** | `#9CA3AF` (gray-400) | `#64748B` (slate-500) | Placeholder, icon mờ |
| **Secondary Text** | `#6B7280` (gray-500) | `#94A3B8` (slate-400) | Caption, metadata |
| **Body Text** | `#374151` (gray-700) | `#CBD5E1` (slate-300) | Nội dung chính |
| **Heading** | `#111827` (gray-900) | `#F1F5F9` (slate-100) | Tiêu đề, tương phản cao |
| **Primary CTA** | `#3B82F6` (primary-500) | `#60A5FA` (primary-400) | Sáng hơn 1 bậc trên nền tối |
| **Primary CTA hover** | `#2563EB` (primary-600) | `#3B82F6` (primary-500) | |
| **Success text** | `#22C55E` (success-500) | `#4ADE80` (green-400) | Sáng hơn để đọc rõ |
| **Success bg** | `#F0FDF4` (success-50) | `#052E16` (green-950) | Nền rất tối |
| **Warning text** | `#F59E0B` (warning-500) | `#FBBF24` (amber-400) | |
| **Warning bg** | `#FFFBEB` (warning-50) | `#451A03` (amber-950) | |
| **Danger text** | `#EF4444` (danger-500) | `#F87171` (red-400) | |
| **Danger bg** | `#FEF2F2` (danger-50) | `#450A0A` (red-950) | |
| **Info text** | `#06B6D4` (info-500) | `#22D3EE` (cyan-400) | |
| **Info bg** | `#ECFEFF` (info-50) | `#083344` (cyan-950) | |
| **Shadow** | `rgba(0,0,0,0.08)` | `rgba(0,0,0,0.3)` | Shadow đậm hơn trên nền tối |

#### CSS Variables (Global Tokens)

Sử dụng CSS custom properties để chuyển đổi linh hoạt giữa 2 chế độ:

```css
/* src/assets/theme.css */

:root {
  /* Surfaces */
  --color-bg:          #F9FAFB;
  --color-surface:     #FFFFFF;
  --color-surface-alt: #F3F4F6;
  --color-border:      #E5E7EB;

  /* Typography */
  --color-text-primary:   #111827;
  --color-text-secondary: #374151;
  --color-text-muted:     #6B7280;
  --color-text-disabled:  #9CA3AF;

  /* Primary */
  --color-primary:       #3B82F6;
  --color-primary-hover:  #2563EB;
  --color-primary-light: #EFF6FF;

  /* Accents */
  --color-success:     #22C55E;
  --color-success-bg:  #F0FDF4;
  --color-warning:     #F59E0B;
  --color-warning-bg:  #FFFBEB;
  --color-danger:      #EF4444;
  --color-danger-bg:   #FEF2F2;
  --color-info:        #06B6D4;
  --color-info-bg:     #ECFEFF;

  /* Shadows */
  --shadow-card:     0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-dropdown: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-modal:    0 20px 60px rgba(0, 0, 0, 0.15);

  /* Transition */
  --theme-transition: background-color 200ms ease, color 200ms ease, border-color 200ms ease;
}

.dark {
  /* Surfaces */
  --color-bg:          #0F172A;
  --color-surface:     #1E293B;
  --color-surface-alt: #334155;
  --color-border:      #475569;

  /* Typography */
  --color-text-primary:   #F1F5F9;
  --color-text-secondary: #CBD5E1;
  --color-text-muted:     #94A3B8;
  --color-text-disabled:  #64748B;

  /* Primary – sáng hơn 1 bậc */
  --color-primary:       #60A5FA;
  --color-primary-hover:  #3B82F6;
  --color-primary-light: #1E3A5F;

  /* Accents – sáng hơn 1 bậc, nền tối hơn */
  --color-success:     #4ADE80;
  --color-success-bg:  #052E16;
  --color-warning:     #FBBF24;
  --color-warning-bg:  #451A03;
  --color-danger:      #F87171;
  --color-danger-bg:   #450A0A;
  --color-info:        #22D3EE;
  --color-info-bg:     #083344;

  /* Shadows – đậm hơn */
  --shadow-card:     0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
  --shadow-dropdown: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-modal:    0 20px 60px rgba(0, 0, 0, 0.5);
}

/* Smooth transition khi chuyển theme */
*,
*::before,
*::after {
  transition: var(--theme-transition);
}
```

#### Zustand Theme Store

```tsx
// src/features/theme/stores/themeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Lưu vào localStorage vì đây là preference, không phải sensitive data
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'techbuildding-theme' }
  )
);
```

#### Theme Provider Hook

```tsx
// src/hooks/useThemeEffect.ts
import { useEffect } from 'react';

import { useThemeStore } from '../features/theme/stores/themeStore';

export function useThemeEffect(): void {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');

      const apply = (e: MediaQueryListEvent | MediaQueryList) => {
        root.classList.toggle('dark', e.matches);
      };

      apply(mq);
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);  // cleanup
    }

    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);  // exhaustive deps
}
```

#### ThemeToggle Component

```tsx
// src/components/ThemeToggle.tsx
import { useCallback } from 'react';

import { useThemeStore } from '../features/theme/stores/themeStore';

// Static – hoisted ngoài component
const THEME_OPTIONS = [
  { value: 'light',  icon: '☀️', label: 'Sáng' },
  { value: 'dark',   icon: '🌙', label: 'Tối' },
  { value: 'system', icon: '💻', label: 'Hệ thống' },
] as const;

export function ThemeToggle(): JSX.Element {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const handleChange = useCallback(
    (value: 'light' | 'dark' | 'system') => {
      setTheme(value);
    },
    [setTheme]
  );

  return (
    <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 dark:bg-dark-card">
      {THEME_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleChange(opt.value)}
          className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
            theme === opt.value
              ? 'bg-white text-gray-900 shadow-sm dark:bg-dark-surface dark:text-slate-100'
              : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          title={opt.label}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
```

#### Cách Dùng Dark Mode Trong Components

```tsx
// Sử dụng class dark: prefix của Tailwind
<div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border">
  <h2 className="text-gray-900 dark:text-slate-100">Tiêu đề</h2>
  <p className="text-gray-700 dark:text-slate-300">Nội dung</p>
  <span className="text-gray-500 dark:text-slate-400">Metadata</span>
</div>

// Hoặc dùng CSS variables (khuyến nghị cho consistency)
<div style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>
  Tự động đổi theo theme
</div>
```

---

## 3. Cấu Trúc Thư Mục (Feature-Based Architecture)

```text
src/
├── assets/                     # Hình ảnh, fonts, CSS global
├── components/                 # Shared UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── DataTable.tsx
│   ├── Modal.tsx
│   ├── LoadingSkeleton.tsx
│   └── ErrorBoundary.tsx
├── config/
│   └── constants.ts            # API_BASE_URL, enums
├── features/                   # Feature modules
│   ├── auth/
│   │   ├── api/
│   │   │   └── authApi.ts      # TanStack Query hooks: useLogin, useRegister…
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── stores/
│   │   │   └── authStore.ts    # Zustand store
│   │   └── types/
│   │       └── auth.types.ts
│   ├── projects/
│   │   ├── api/
│   │   │   └── projectApi.ts
│   │   ├── components/
│   │   │   ├── ProjectList.tsx
│   │   │   ├── ProjectDetail.tsx
│   │   │   ├── ProjectForm.tsx
│   │   │   └── MemberManager.tsx
│   │   └── types/
│   │       └── project.types.ts
│   ├── attendance/
│   │   ├── api/
│   │   │   └── attendanceApi.ts
│   │   ├── components/
│   │   │   ├── CheckInForm.tsx
│   │   │   ├── AttendanceHistory.tsx
│   │   │   └── GeofenceMap.tsx
│   │   └── types/
│   │       └── attendance.types.ts
│   ├── materials/
│   │   ├── api/
│   │   │   └── materialApi.ts
│   │   ├── components/
│   │   │   ├── MaterialList.tsx
│   │   │   ├── MaterialRequestList.tsx
│   │   │   └── MaterialRequestForm.tsx
│   │   └── types/
│   │       └── material.types.ts
│   ├── worklogs/
│   │   ├── api/
│   │   │   └── worklogApi.ts
│   │   ├── components/
│   │   │   ├── WorkLogList.tsx
│   │   │   └── WorkLogForm.tsx
│   │   └── types/
│   │       └── worklog.types.ts
│   ├── contracts/
│   │   ├── api/
│   │   │   └── contractApi.ts
│   │   ├── components/
│   │   │   ├── ContractList.tsx
│   │   │   └── ContractForm.tsx
│   │   └── types/
│   │       └── contract.types.ts
│   └── users/
│       ├── api/
│       │   └── userApi.ts
│       ├── components/
│       │   ├── UserList.tsx
│       │   └── UserForm.tsx
│       └── types/
│           └── user.types.ts
├── hooks/                      # Shared custom hooks
│   ├── useDebounce.ts
│   ├── useGeolocation.ts
│   └── useClickOutside.ts
├── layouts/
│   ├── MainLayout.tsx          # Sidebar + Header + Outlet (Slot Pattern)
│   └── AuthLayout.tsx
├── pages/
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── NotFoundPage.tsx
├── routes/
│   ├── AppRoutes.tsx
│   └── ProtectedRoute.tsx
├── services/
│   └── axiosInstance.ts        # Axios config + Interceptors
├── types/
│   └── api.types.ts            # ResponseData<T> generic
└── utils/
    ├── formatDate.ts
    └── formatCurrency.ts
```

---

## 4. TypeScript Types (Map từ Backend DTO)

> **Quy tắc (React_Skill: `typescript`):** Không dùng `any`. Dùng `interface` cho object shapes, `type` cho union/intersection. Không dùng `React.FC`.

### 3.1. API Response Wrapper

```tsx
// src/types/api.types.ts

// Map từ ResponseData<T> của backend
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

// Pagination (nếu backend hỗ trợ)
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}
```

### 3.2. Auth Types

```tsx
// src/features/auth/types/auth.types.ts

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName?: string;
  phone?: string;
  email?: string;
}

export interface VerifyOtpRequest {
  username: string;
  otpCode: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}
```

### 3.3. User Types

export type UserStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE';
export type UserRole = 'ADMIN' | 'PM' | 'STAFF' | 'PARTNER' | 'GUEST';

export interface User {
  id: number;
  username: string;
  fullName: string;
  phone: string;
  email: string;
  avatarUrl: string | null;
  status: UserStatus;
  createdAt: string;
  roles: UserRole[];
}

### 3.4. Project Types

```tsx
// src/features/projects/types/project.types.ts

export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'SUSPENDED';

export interface Project {
  id: number;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  createdAt: string;
}

export interface ProjectRequest {
  name: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  startDate?: string;
  endDate?: string;
  status?: ProjectStatus;
}

export interface ProjectMember {
  userId: number;
  username: string;
  fullName: string;
  role: string;
}
```

### 3.5. Attendance Types

```tsx
// src/features/attendance/types/attendance.types.ts

export interface AttendanceRecord {
  id: number;
  userId: number;
  username: string;
  fullName: string;
  projectId: number;
  projectName: string;
  checkInAt: string;
  gpsLatIn: number;
  gpsLongIn: number;
  selfieUrlIn: string | null;
  checkOutAt: string | null;
  gpsLatOut: number | null;
  gpsLongOut: number | null;
  selfieUrlOut: string | null;
  distanceInMeters: number | null;
  status: string;
  workingHours: number | null;
}
```

### 3.6. Material, Contract, WorkLog Types

```tsx
// src/features/materials/types/material.types.ts
export interface Material {
  id: number;
  name: string;
  unit: string;
}

// src/features/contracts/types/contract.types.ts
export interface Contract {
  id: number;
  projectId: number;
  projectName: string;
  contractNumber: string;
  contractName: string;
  partnerName: string;
  contractValue: number;
  status: string;
  fileUrl: string | null;
}

// src/features/worklogs/types/worklog.types.ts
export interface WorkLog {
  id: number;
  projectId: number;
  projectName: string;
  userId: number;
  username: string;
  logDate: string;
  weatherCondition: string;
  workerCount: number;
  content: string;
  status: string;
  mediaUrls: string[];
}
```

---

## 5. Axios Instance & Interceptors

> **Quy tắc (React_Skill: `security`):** Token lưu trong Zustand memory (không localStorage). Interceptor tự động gắn Bearer token & refresh khi 401.

```tsx
// src/services/axiosInstance.ts
import axios from 'axios';

import { useAuthStore } from '../features/auth/stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor: gắn token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: auto refresh token khi 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const { data } = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          refreshToken,
        });

        const { setTokens } = useAuthStore.getState();
        setTokens(data.data.accessToken, data.data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

---

## 6. Zustand Store (Auth)

> **Quy tắc (React_Skill: `state-management`):** Zustand cho client state (Auth, UI). Server state dùng TanStack Query.

```tsx
// src/features/auth/stores/authStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { User } from '../../users/types/user.types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,

    setTokens: (accessToken, refreshToken) =>
      set({ accessToken, refreshToken, isAuthenticated: true }),

    setUser: (user) => set({ user }),

    logout: () =>
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      }),
  }))
);
```

---

## 7. TanStack Query – API Hooks

> **Quy tắc (React_Skill: `hooks`):** Custom hooks prefix `use*`. Cleanup required cho useEffect. Exhaustive deps luôn tuân thủ.

### 6.1. Auth API

```tsx
// src/features/auth/api/authApi.ts
import { useMutation } from '@tanstack/react-query';

import { api } from '../../../services/axiosInstance';
import { useAuthStore } from '../stores/authStore';
import type { ApiResponse } from '../../../types/api.types';
import type { LoginRequest, RegisterRequest, TokenResponse, VerifyOtpRequest } from '../types/auth.types';

// POST /api/v1/auth/login
export function useLogin() {
  const setTokens = useAuthStore((s) => s.setTokens);

  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const { data } = await api.post<ApiResponse<TokenResponse>>('/auth/login', payload);
      return data.data;
    },
    onSuccess: (tokens) => {
      setTokens(tokens.accessToken, tokens.refreshToken);
    },
  });
}

// POST /api/v1/auth/register
export function useRegister() {
  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      const { data } = await api.post<ApiResponse<unknown>>('/auth/register', payload);
      return data;
    },
  });
}

// POST /api/v1/auth/verify-otp
export function useVerifyOtp() {
  const setTokens = useAuthStore((s) => s.setTokens);

  return useMutation({
    mutationFn: async (payload: VerifyOtpRequest) => {
      const { data } = await api.post<ApiResponse<TokenResponse>>('/auth/verify-otp', payload);
      return data.data;
    },
    onSuccess: (tokens) => {
      setTokens(tokens.accessToken, tokens.refreshToken);
    },
  });
}
```

### 6.2. Projects API

```tsx
// src/features/projects/api/projectApi.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../../../services/axiosInstance';
import type { ApiResponse } from '../../../types/api.types';
import type { Project, ProjectMember, ProjectRequest } from '../types/project.types';

const PROJECTS_KEY = ['projects'] as const;

// GET /api/v1/projects
export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Project[]>>('/projects');
      return data.data;
    },
    staleTime: 5 * 60 * 1000,  // 5 phút
  });
}

// GET /api/v1/projects/:id
export function useProject(projectId: number) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, projectId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Project>>(`/projects/${projectId}`);
      return data.data;
    },
    enabled: projectId > 0,
  });
}

// POST /api/v1/projects
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ProjectRequest) => {
      const { data } = await api.post<ApiResponse<Project>>('/projects', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

// GET /api/v1/projects/:id/members
export function useProjectMembers(projectId: number) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, projectId, 'members'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<ProjectMember[]>>(
        `/projects/${projectId}/members`
      );
      return data.data;
    },
    enabled: projectId > 0,
  });
}
```

### 6.3. Attendance API

```tsx
// src/features/attendance/api/attendanceApi.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '../../../services/axiosInstance';
import type { ApiResponse } from '../../../types/api.types';
import type { AttendanceRecord } from '../types/attendance.types';

const ATTENDANCE_KEY = ['attendance'] as const;

// POST /api/v1/attendance/check-in (multipart/form-data)
export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post<ApiResponse<AttendanceRecord>>(
        '/attendance/check-in',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY });
    },
  });
}

// POST /api/v1/attendance/check-out/:projectId (multipart/form-data)
export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, formData }: { projectId: number; formData: FormData }) => {
      const { data } = await api.post<ApiResponse<AttendanceRecord>>(
        `/attendance/check-out/${projectId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_KEY });
    },
  });
}

// GET /api/v1/attendance/personal/:userId
export function usePersonalAttendance(userId: number) {
  return useQuery({
    queryKey: [...ATTENDANCE_KEY, 'personal', userId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AttendanceRecord[]>>(
        `/attendance/personal/${userId}`
      );
      return data.data;
    },
    enabled: userId > 0,
  });
}

// GET /api/v1/attendance/project/:projectId
export function useProjectAttendance(projectId: number) {
  return useQuery({
    queryKey: [...ATTENDANCE_KEY, 'project', projectId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AttendanceRecord[]>>(
        `/attendance/project/${projectId}`
      );
      return data.data;
    },
    enabled: projectId > 0,
  });
}

// GET /api/v1/attendance/export/excel/:projectId → Blob download
export function useExportAttendanceExcel() {
  return useMutation({
    mutationFn: async (projectId: number) => {
      const response = await api.get(`/attendance/export/excel/${projectId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_project_${projectId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  });
}
```

---

## 8. Component Patterns

> **Quy tắc (React_Skill: `component-patterns`):**
> - Function Components only. Named exports. PascalCase.
> - Props: explicit `interface`, destructure trong params.
> - Imports: Built-in → External → Internal → Styles.
> - < 250 dòng / component. Một component / file.
> - Ternary cho conditional rendering (không `&&`).
> - Extract static JSX/objects ra ngoài component.

### 7.1. Layout – Slot Pattern (Composition)

```tsx
// src/layouts/MainLayout.tsx
import { type ReactNode, Suspense } from 'react';

import { Outlet } from 'react-router-dom';

import { LoadingSkeleton } from '../components/LoadingSkeleton';

// Props: dùng interface, không dùng React.FC
interface MainLayoutProps {
  sidebar?: ReactNode;    // Slot pattern
  header?: ReactNode;
}

export function MainLayout({ sidebar, header }: MainLayoutProps): JSX.Element {
  return (
    <div className="flex h-screen bg-gray-50">
      {sidebar ? <aside className="w-64 border-r">{sidebar}</aside> : null}
      <div className="flex flex-1 flex-col">
        {header ? <header className="h-16 border-b px-6">{header}</header> : null}
        <main className="flex-1 overflow-auto p-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
```

### 7.2. LoginForm – React Hook Form + Zod

```tsx
// src/features/auth/components/LoginForm.tsx
import { type ChangeEvent, useCallback } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useLogin } from '../api/authApi';

// Zod schema
const loginSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải ≥ 3 ký tự'),
  password: z.string().min(6, 'Mật khẩu phải ≥ 6 ký tự'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm(): JSX.Element {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Không inline handler – khai báo trước return
  const onSubmit = useCallback(
    async (formData: LoginFormData) => {
      await loginMutation.mutateAsync(formData);
      navigate('/');
    },
    [loginMutation, navigate]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="username">Tên đăng nhập</label>
        <input id="username" {...register('username')} />
        {errors.username ? <p className="text-red-500">{errors.username.message}</p> : null}
      </div>

      <div>
        <label htmlFor="password">Mật khẩu</label>
        <input id="password" type="password" {...register('password')} />
        {errors.password ? <p className="text-red-500">{errors.password.message}</p> : null}
      </div>

      {loginMutation.isError ? (
        <p className="text-red-500">Đăng nhập thất bại. Vui lòng thử lại.</p>
      ) : null}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
      </button>
    </form>
  );
}
```

### 7.3. DataTable – Generic Component (Render Props)

```tsx
// src/components/DataTable.tsx
import type { ReactNode } from 'react';

// Generic Props (React_Skill: typescript – Generics)
interface DataTableProps<T> {
  items: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
}

interface ColumnDef<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
}

// Hoisting: static component bên ngoài
const EMPTY_ARRAY: never[] = [];

export function DataTable<T>({
  items,
  columns,
  isLoading = false,
  emptyMessage = 'Không có dữ liệu',
}: DataTableProps<T>): JSX.Element {
  if (isLoading) {
    return <div className="animate-pulse">Đang tải...</div>;
  }

  return items.length > 0 ? (
    <table className="min-w-full divide-y">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={index}>
            {columns.map((col) => (
              <td key={col.key}>{col.render(item)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p>{emptyMessage}</p>
  );
}
```

### 7.4. ProjectList – Sử dụng TanStack Query + DataTable

```tsx
// src/features/projects/components/ProjectList.tsx
import { useMemo } from 'react';

import { Link } from 'react-router-dom';

import { DataTable, type ColumnDef } from '../../../components/DataTable';
import { useProjects } from '../api/projectApi';
import type { Project } from '../types/project.types';

// Hoisting: column definitions ngoài component (tránh re-create)
const PROJECT_COLUMNS: ColumnDef<Project>[] = [
  { key: 'name', header: 'Tên dự án', render: (p) => <Link to={`/projects/${p.id}`}>{p.name}</Link> },
  { key: 'address', header: 'Địa chỉ', render: (p) => p.address },
  { key: 'status', header: 'Trạng thái', render: (p) => <span className="badge">{p.status}</span> },
  { key: 'startDate', header: 'Ngày bắt đầu', render: (p) => p.startDate },
];

export function ProjectList(): JSX.Element {
  const { data: projects, isLoading } = useProjects();

  return (
    <section>
      <h1>Danh sách dự án</h1>
      <DataTable<Project>
        items={projects ?? []}
        columns={PROJECT_COLUMNS}
        isLoading={isLoading}
        emptyMessage="Chưa có dự án nào."
      />
    </section>
  );
}
```

---

## 9. Custom Hooks

> **Quy tắc (React_Skill: `hooks`):** Prefix `use*`, cleanup useEffect, exhaustive deps, lazy state init.

### 8.1. useGeolocation (cho Attendance Check-in)

```tsx
// src/hooks/useGeolocation.ts
import { useCallback, useEffect, useState } from 'react';

interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseGeolocationReturn {
  position: GeoPosition | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ Geolocation');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setIsLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchPosition();
  }, [fetchPosition]);

  return { position, error, isLoading, refetch: fetchPosition };
}
```

### 8.2. useDebounce

```tsx
// src/hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);   // cleanup bắt buộc
  }, [value, delay]);

  return debouncedValue;
}
```

---

## 10. Routing & Protected Routes

```tsx
// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from '../features/auth/stores/authStore';

export function ProtectedRoute(): JSX.Element {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
```

```tsx
// src/routes/AppRoutes.tsx
import { lazy } from 'react';

import { Route, Routes } from 'react-router-dom';

import { MainLayout } from '../layouts/MainLayout';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { ProtectedRoute } from './ProtectedRoute';

// Lazy load heavy pages (React_Skill: performance – Bundle Optimization)
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const ProjectListPage = lazy(() => import('../pages/ProjectListPage'));
const ProjectDetailPage = lazy(() => import('../pages/ProjectDetailPage'));
const AttendancePage = lazy(() => import('../pages/AttendancePage'));
const MaterialsPage = lazy(() => import('../pages/MaterialsPage'));
const WorkLogsPage = lazy(() => import('../pages/WorkLogsPage'));
const ContractsPage = lazy(() => import('../pages/ContractsPage'));
const UsersPage = lazy(() => import('../pages/UsersPage'));

export function AppRoutes(): JSX.Element {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout sidebar={<Sidebar />} header={<Header />} />}>
          <Route index element={<DashboardPage />} />
          <Route path="projects" element={<ProjectListPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="materials" element={<MaterialsPage />} />
          <Route path="worklogs" element={<WorkLogsPage />} />
          <Route path="contracts" element={<ContractsPage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
```

---

## 11. Error Boundary

> **Quy tắc (React_Skill: `component-patterns`):** Wrap features với `react-error-boundary`.

```tsx
// src/components/ErrorBoundary.tsx
import { type ReactNode, useCallback } from 'react';

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h2 className="text-xl font-bold text-red-600">Đã xảy ra lỗi</h2>
      <p className="text-gray-600">{error.message}</p>
      <button onClick={resetErrorBoundary} className="mt-4 rounded bg-blue-500 px-4 py-2 text-white">
        Thử lại
      </button>
    </div>
  );
}

interface AppErrorBoundaryProps {
  children: ReactNode;
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps): JSX.Element {
  const handleReset = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback} onReset={handleReset}>
      {children}
    </ReactErrorBoundary>
  );
}
```

---

## 12. Performance Checklist

> **Tuân thủ React_Skill: `performance` (P0)**

- [ ] **Lazy Load:** Dùng `React.lazy` cho pages, charts, modals (đã áp dụng ở routing).
- [ ] **No Barrel Files:** Import trực tiếp `import { Button } from './Button'`, KHÔNG `from './components'`.
- [ ] **Static Hoisting:** Column definitions, config objects khai báo ngoài component.
- [ ] **useMemo:** Dùng cho computed lists, filtered data.
- [ ] **Virtualization:** Dùng `react-window` cho bảng > 50 hàng (Attendance history, WorkLog list).
- [ ] **No moment.js:** Dùng `dayjs` hoặc native `Intl.DateTimeFormat`.
- [ ] **Promise.all:** Fetch các API độc lập song song (Dashboard).

---

## 13. Security Checklist

> **Tuân thủ React_Skill: `security` (P0)**

- [ ] **Token Storage:** Zustand (in-memory), KHÔNG lưu vào `localStorage`.
- [ ] **Permissions:** Backend validate quyền, frontend chỉ ẩn/hiện UI.
- [ ] **XSS:** Không dùng `dangerouslySetInnerHTML`. Nếu bắt buộc → `DOMPurify.sanitize()`.
- [ ] **Dependencies:** `npm audit` thường xuyên. Pin versions.
- [ ] **Secrets:** Server-side only. `.env` chỉ chứa `VITE_API_BASE_URL`.
- [ ] **URL Validation:** Kiểm tra `javascript:` protocol trong user-generated links.

---

## 14. Testing Strategy

> **Tuân thủ React_Skill: `testing` (P2)**

```tsx
// Ví dụ test LoginForm
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { LoginForm } from '../features/auth/components/LoginForm';

describe('LoginForm', () => {
  it('hiển thị lỗi khi submit form trống', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole('button', { name: /đăng nhập/i }));

    expect(await screen.findByText(/tên đăng nhập phải/i)).toBeInTheDocument();
    expect(await screen.findByText(/mật khẩu phải/i)).toBeInTheDocument();
  });
});
```

**Nguyên tắc:**
- `getByRole` > `getByText` > `getByTestId`.
- `userEvent` (async) thay vì `fireEvent`.
- Network mocking: dùng **MSW** (Mock Service Worker).
- Không test implementation details (state, internal vars).

---

## 15. Kế Hoạch Triển Khai (Lộ Trình)

### Phase 1: Foundation (1-2 ngày)
1. Khởi tạo dự án: `npx create-vite@latest . --template react-ts`
2. Cài Tailwind CSS, React Router, TanStack Query, Zustand, Axios, React Hook Form, Zod.
3. Setup cấu trúc thư mục theo section 2.
4. Tạo `axiosInstance.ts` (section 4) và `authStore.ts` (section 5).
5. Dựng `MainLayout`, `AuthLayout`, `ProtectedRoute`, `ErrorBoundary`.

### Phase 2: Auth Module & Guest Flow (1-2 ngày)
1. Tạo types, API hooks cho Auth.
2. Tạo `LoginForm`, `RegisterForm` (Mặc định đăng ký sẽ nhận role `GUEST`).
3. Giao diện `RequestPermission`: Sau khi đăng nhập, guest thấy trang thông báo "Đang chờ cấp quyền" và nút "Gửi yêu cầu quyền cụ thể".
4. Admin Dashboard: Module quản lý 'Permission Requests', cho phép Admin phê duyệt/từ chối và gán Role mới.
5. Protected routing: Kiểm soát nếu là `GUEST` thì chỉ được xem trang `RequestPermission`.

### Phase 3: Projects (2 ngày)
1. `ProjectList` + `DataTable` (generic component).
2. `ProjectDetail` page (Tabs: Info, Members, WorkLogs, Contracts).
3. `ProjectForm` (tạo/sửa dự án, tích hợp bản đồ chọn tọa độ).
4. `MemberManager` (thêm/xóa thành viên).

### Phase 4: Attendance (2 ngày)
1. `useGeolocation` hook.
2. `CheckInForm` (camera selfie + GPS + project selector).
3. `GeofenceMap` (hiển thị bán kính geofencing trên bản đồ).
4. `AttendanceHistory` (bảng + bộ lọc + xuất Excel).

### Phase 5: Materials & WorkLogs (1-2 ngày)
1. CRUD Materials.
2. Material Requests (tạo yêu cầu, duyệt/từ chối, lọc theo dự án).
3. WorkLog list + form (upload hình ảnh multipart).

### Phase 6: Contracts & Dashboard (1-2 ngày)
1. Contract CRUD (upload file hợp đồng).
2. Dashboard: biểu đồ Recharts (thống kê dự án, chấm công, vật tư).

### Phase 7: Polish (1 ngày)
1. Loading Skeletons, Error states.
2. Responsive design (mobile friendly).
3. Accessibility audit.
4. `npm audit` & bundle analysis.

---

## 16. Kế Hoạch Mở Rộng Chi Tiết (Product Roadmap)

Dựa trên tài liệu Profile TechBuilder JSC, hệ thống sẽ được nâng cấp toàn diện với 9 module cốt lõi:

### Phase 8: Phạm vi Công việc & Nhân sự dự án
1. **Thiết lập thông tin dự án:** Tên, mã hiệu, phân cấp (Khu vực -> Tầng -> Căn hộ).
2. **Quản lý nhân sự:** Phân quyền tiếp cận thông tin theo từng vị trí tham gia.
3. **Kế hoạch tổng thể (Master Plan):** Theo dõi tiến độ và đánh giá "sức khỏe" dự án chủ động.

### Phase 9: Quản lý Đối tác & Quyền truy cập
1. **Dữ liệu đối tác (Partner Directory):** 
   - Xây dựng cơ sở dữ liệu tập trung cho Chủ đầu tư (Client), Nhà thầu (Contractor), Nhà cung cấp (Supplier).
   - Quản lý Hồ sơ năng lực (Profile), Mã số thuế (Tax Code), và phân loại đối tác (Type).
   - Lưu trữ đơn giá định mức và lịch sử hợp tác để hỗ trợ quá trình đấu thầu.
2. **Hệ thống phân quyền cho Đối tác (Partner RBAC):**
   - Áp dụng Global Role `PARTNER` kết hợp với gán quyền theo dự án cụ thể.
   - **Nguyên tắc cô lập dữ liệu:** Đối tác chỉ nhìn thấy các dự án, bản vẽ, và hợp đồng mà họ trực tiếp tham gia.
3. **Partner Portal (Cổng thông tin đối tác):**
   - **Xử lý Bản vẽ:** Cho phép nhà thầu thiết kế/thi công upload bản vẽ, nhận phản hồi (Comments) và theo dõi phiên bản (Revisions).
   - **Tiến độ thi công:** Nhà thầu cập nhật trực tiếp trạng thái các hạng mục được giao, PM TechBuilder phê duyệt sản lượng.
   - **Đấu thầu & Chào giá:** Nhà thầu nhận RFQ (Yêu cầu báo giá), nộp hồ sơ đấu thầu và theo dõi kết quả online.
   - **Cổng Hợp đồng:** Xem nội dung hợp đồng, phụ lục và thực hiện ký số/xác nhận các biên bản nghiệm thu.

### Phase 10: Quản lý Hợp đồng & Hạng mục (BOQ)
1. **Kho lưu trữ hợp đồng:** Theo dõi tiến trình, phụ lục và quyền tiếp cận.
2. **Hạng mục công việc (Work Items):** Quản lý mô hình cây, kết nối khối lượng từ mô hình BIM.
3. **Quản lý Vật tư theo hợp đồng:** Hạn mức vật tư cấp bởi CĐT và Nhà thầu.

### Phase 11: Quản lý Thiết kế & BIM (IFC View)
1. **Hồ sơ thiết kế:** Lưu trữ, phát hành theo khu vực. Báo cáo cập nhật thiết kế định kỳ.
2. **Trao đổi kỹ thuật (RFI/CRF):** Tương tác trực tiếp trên môi trường bản vẽ, theo dõi trạng thái giải quyết.
3. **View IFC:** Tích hợp môi trường xem file 3D IFC cho các định dạng BIM.

### Phase 12: Đấu thầu & Lựa chọn Nhà thầu
1. **Lập gói thầu:** Phân chia gói thầu từ hợp đồng gốc, thiết lập tiêu chí đánh giá.
2. **Thực thi đấu thầu:** Mời thầu, nhà thầu nộp hồ sơ và trao đổi làm rõ trên hệ thống.
3. **So sánh & Phê duyệt:** Hệ thống tự động so sánh giá, phê duyệt và chuyển đổi gói thầu thành hợp đồng chính thức.

### Phase 13: Quản lý Thư viện Vật tư Tập trung (PMMS)

Đây là hệ thống cốt lõi để quản lý dữ liệu số cho các dự án xây dựng, được thiết kế theo cấu trúc phân tầng: **Phân hệ (Sub-system) -> Lớp (Layer) -> Vật tư (Item)**.

1. **Phân loại hệ thống (System Classification):**
   - Phân chia dữ liệu theo các bộ môn kỹ thuật chính:
     - `LABOR`: Nhân công thi công xây dựng.
     - `BUILDING`: Vật liệu xây dựng cơ bản.
     - `HVAC`: Hệ thống Điều hòa & Thông gió.
     - `ELECTRICAL`: Hệ thống Điện - Điện nhẹ.
     - `PLUMBING`: Hệ thống Cấp thoát nước (CTN).
     - `SUPPORT`: Vật tư phụ và phụ kiện.
     - `PPE`: Thiết bị bảo hộ & An toàn lao động.

2. **Cấu trúc dữ liệu Vật tư (PMMS Data Model):**
   - **Mã quản lý (Code):** Unique identifier cho từng loại vật tư.
   - **Mô tả chi tiết:** Thông số kỹ thuật, quy cách đóng gói.
   - **Tài liệu đính kèm:** Hình ảnh thực tế (Photos) và Catalogue sản phẩm (PDF).
   - **Liên kết dữ liệu BIM (Revit Sync):**
     - `revitFamilyCategory`: Danh mục family trong Revit.
     - `revitCode`: Mã tương ứng để đồng bộ thuộc tính vào mô hình.

3. **Quy trình Định mức & MR:**
   - **Định mức chiết tính:** Thiết lập hạn mức sử dụng nguồn lực cho từng loại công việc/BOQ.
   - **Yêu cầu vật tư (MR):** Quy trình lập - kiểm tra - phê duyệt đề nghị vật tư online (Tích hợp luồng Submission).

---

### Phase 14: Quy trình Đệ trình & Chữ ký số
1. **Tự động hóa quy trình:** Thiết lập luồng phê duyệt linh hoạt cho từng loại hồ sơ.
2. **Cảnh báo chủ động:** Nhắc nhở qua Mobile/Web khi đến lượt xử lý.
3. **Tích hợp chữ ký số:** Sử dụng VNPT Smart CA và chữ ký điện tử xác thực ngay trên App/Web.

### Phase 15: Quản lý Công trường & Ảnh hiện trường
1. **Tiến độ EVM:** Liên kết Master Plan với BOQ hợp đồng để đánh giá sản lượng thu/chi.
2. **Báo cáo ngày (Daily Report):** Tự động hóa báo cáo, kết nối sản thực thực tế với tiến độ.
3. **Ảnh Keyplan & VR360:** Đính ảnh chụp vào mặt bằng (Keyplan), so sánh phiên bản và giám sát từ xa qua Tour VR360.

---

## 17. Hệ Thống Phân Quyền (RBAC - Role Based Access Control)

Hệ thống áp dụng mô hình phân quyền đa cấp để đảm bảo tính bảo mật và đúng vai trò chuyên môn (SOP).

### 17.1. Cấu Trúc Quyền Hạn
Hệ thống phân tách rạch ròi giữa **Global Roles** (toàn hệ thống) và **Project Roles** (theo từng dự án).

#### A. Global Roles (Quyền Hệ Thống)
Được lưu trong JWT Token và quản lý bởi `authStore`. Một người dùng có thể có nhiều Global Roles.

| Vai trò | Mã định danh | Phạm vi truy cập |
|---|---|---|
| **Administrator** | `ADMIN` | Quản lý người dùng, phê duyệt phân quyền, cấu hình hệ thống global. |
| **Project Manager** | `PM` | Đại diện chủ sở hữu dự án, xem toàn bộ dự án, tạo dự án mới. |
| **Staff** | `STAFF` | Nhân viên nghiệp vụ chính thức của TechBuilder. |
| **Partner** | `PARTNER` | Tài khoản dành cho các đơn vị bên thứ 3 (CĐT, Nhà thầu phụ). |
| **Guest** | `GUEST` | Tài khoản mới đăng ký, chưa được xác thực (Restricted access). |

#### B. Project Roles (Quyền Trong Dự Án)
Xác định chức danh của thành viên bên trong một dự án cụ thể. Được quản lý bởi PM dự án đó.

| Vai trò dự án | Mô tả chuyên môn |
|---|---|
| **PM (Project Manager)** | Quản lý cao nhất tại dự án (Project Lead). |
| **SUPERVISOR** | Giám sát hiện trường, chịu trách nhiệm duyệt/xác nhận nhật ký & vật tư. |
| **ENGINEER** | Kỹ sư kỹ thuật, thực hiện báo cáo, đệ trình và quản lý khối lượng. |
| **WORKER** | Công nhân kỹ thuật, đối tượng được gán việc và chấm công. |

### 17.2. Ma Trận Quyền Hạn (Permissions Matrix)

| Module Chức Năng | Admin | Project Manager | Internal Staff | Partner Account | Guest |
|---|:---:|:---:|:---:|:---:|:---:|
| **Hệ thống/User** | Full | No | No | No | No |
| **Danh mục Dự án** | View All | Manage | View | View | No |
| **Kế hoạch (Master Plan)**| View All | Manage | View/Edit | View | No |
| **Vị trí (Zones)** | View All | Manage | Manage | View | No |
| **Hợp đồng & BOQ** | View All | Manage | View | Own Contract | No |
| **Báo cáo Ngày (Daily)** | View All | Approve | Create | View | No |
| **Vật tư & Thiết bị** | Full | Approve | Request | View | No |
| **Chấm công (Attendance)**| Full | Project Report | Personal | No | No |

### 17.3. Hướng Dẫn Triển Khai Trên Frontend (Patterns)

#### A. Kiểm tra quyền tại Layout/Route
Sử dụng `ProtectedRoute` để kiểm soát truy cập trang. `GUEST` sẽ tự động bị điều hướng về trang chờ phê duyệt.

```tsx
// Pattern: Chặn Guest chưa được duyệt
const isOnlyGuest = user?.roles?.length === 1 && user.roles[0] === 'GUEST';
if (isOnlyGuest) return <Navigate to="/pending-approval" />;
```

#### B. Ẩn/Hiện Menu (Sidebar)
Thực hiện lọc danh sách menu dựa trên mảng `roles` của user.

```tsx
const isAdmin = user?.roles?.includes('ADMIN');
const filteredMenus = allMenus.filter(m => m.isAdminOnly ? isAdmin : true);
```

#### C. Phân biệt Global vs Project Role trong Logic
Lưu ý sự khác biệt khi kiểm tra quyền thực thi hành động:

```tsx
// 1. Kiểm tra Global Role (Dùng cho các trang quản trị chung)
const isManager = user?.roles?.some(r => ['ADMIN', 'PM'].includes(r));

// 2. Kiểm tra Project Role (Dùng trong Project Detail)
// Cần lấy role từ thông tin thành viên (ProjectMember) của user hiện tại trong dự án đó
const myRoleInProject = members.find(m => m.userId === currentUser.id)?.assignedRole;
const canApprove = myRoleInProject === 'SUPERVISOR' || myRoleInProject === 'PM';
```

### 17.4. Luồng Phê Duyệt Quyền (Guest Flow)
Hệ thống áp dụng quy trình "Trust but Verify":
1. **Registration**: User đăng ký -> Gán `GUEST`.
2. **Request**: User chọn role mong muốn (Vd: `PM`) -> Tạo `RoleRequest` (PENDING).
3. **Approval**: Admin duyệt yêu cầu -> Update Role cho User -> Gỡ bỏ hạn chế truy cập.
4. **Assignment**: Sau khi có role chính thức, User được gán vào các Dự án cụ thể để bắt đầu làm việc.

---

## 18. Chi tiết Kỹ thuật Phase 11: Quản lý Thiết kế & BIM

Mô-đun này tập trung vào quản lý hồ sơ thiết kế, quy trình RFI và tích hợp mô hình 3D.

### 18.1. Data Models (Types)

```tsx
// src/features/design/types/design.types.ts

export type DesignDiscipline = 'ARCH' | 'STRUC' | 'MEP' | 'LANDSCAPE' | 'INTERIOR';
export type DesignStatus = 'PRELIMINARY' | 'FOR_REVIEW' | 'IFC' | 'AS_BUILT';

export interface DesignSheet {
  id: number;
  projectId: number;
  zoneId: number;
  sheetNumber: string;
  title: string;
  discipline: DesignDiscipline;
  revision: string;
  status: DesignStatus;
  fileUrl: string;       // PDF/DWG link trong MinIO
  thumbnailUrl?: string;
  issuedAt: string;
  issuedBy: number;
}

// src/features/design/types/rfi.types.ts

export type RfiStatus = 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';

export interface Rfi {
  id: number;
  projectId: number;
  title: string;
  question: string;
  suggestedSolution?: string;
  status: RfiStatus;
  assignedTo: number;    // User ID
  createdBy: number;
  createdAt: string;
  resolvedAt?: string;
  drawingRef?: {
    sheetId: number;
    coordinates: { x: number, y: number }; // Vị trí điểm đánh dấu trên bản vẽ
  };
}
```

### 18.2. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/projects/{id}/design-sheets` | Lấy danh sách hồ sơ theo dự án |
| `POST` | `/api/v1/design-sheets` | Upload hồ sơ mới (Multipart) |
| `GET` | `/api/v1/projects/{id}/rfis` | Danh sách RFI của dự án |
| `POST` | `/api/v1/rfis` | Tạo RFI mới |
| `PATCH` | `/api/v1/rfis/{id}/status` | Cập nhật trạng thái RFI |

### 18.3. BIM Integration (IFC Viewer)

- **Library sử dụng:** `web-ifc-viewer` (từ dự án [IFC.js](https://ifcjs.github.io/info/)).
- **Quy trình xử lý:**
    1. User upload file `.ifc` lên hệ thống.
    2. Backend lưu vào MinIO.
    3. Frontend dùng tải file từ URL được ký (signed URL) của MinIO.
    4. Hiển thị UI điều khiển: Zoom, Pan, Orbit, Selection (Property Inspection).

### 18.4. UI Component Hierarchy

- `DesignModule/`:
    - `DesignExplorer`: Sidebar lọc theo Zone và Discipline.
    - `SheetGrid`: Hiển thị danh sách bản vẽ dạng card/thumbnail.
    - `RevisionHistory`: Modal xem lịch sử các phiên bản của một đầu mục bản vẽ.
- `RfiModule/`:
    - `RfiBoard`: Kanban hoặc List view theo trạng thái.
    - `DrawingMarker`: Component overlay cho phép chấm điểm RFI lên bản vẽ PDF.
- `BimModule/`:
    - `IfcViewerContainer`: Canvas 3D rendering.
    - `PropertyPanel`: Hiển thị thông số kỹ thuật của linh kiện khi click trong 3D.

---

## 19. Chi tiết Kỹ thuật Phase 12: Đấu thầu & Lựa chọn Nhà thầu

Mô-đun này quản lý quy trình từ lập gói thầu, mời thầu đến so sánh giá và chọn nhà thầu.

### 19.1. Data Models (Types)

```tsx
// src/features/bidding/types/bidding.types.ts

export type BiddingStatus = 'DRAFT' | 'PUBLISHED' | 'INVITING' | 'EVALUATING' | 'CLOSED' | 'CANCELLED';

export interface BiddingPackage {
  id: number;
  projectId: number;
  packageCode: string;
  packageName: string;
  description?: string;
  budget?: number;
  status: BiddingStatus;
  deadline: string;
  criteria: string; // JSON string chứa các tiêu chí đánh giá
  createdAt: string;
}

export interface BidSubmission {
  id: number;
  packageId: number;
  partnerId: number;
  bidPrice: number;
  proposalFileUrl?: string; // Link đến file hồ sơ năng lực/giải pháp
  submissionDate: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  notes?: string;
}
```

### 19.2. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/projects/{id}/bidding-packages` | Danh sách gói thầu của dự án |
| `POST` | `/api/v1/bidding-packages` | Tạo gói thầu mới |
| `POST` | `/api/v1/bidding-packages/{id}/invite` | Mời thầu (gửi email/thông báo) |
| `POST` | `/api/v1/bid-submissions` | Nhà thầu nộp hồ sơ thầu |
| `GET` | `/api/v1/bidding-packages/{id}/comparison` | Lấy dữ liệu so sánh các hồ sơ thầu |
| `PATCH` | `/api/v1/bidding-packages/{id}/approve` | Phê duyệt kết quả và tạo hợp đồng |

### 19.3. Bidding & Selection Workflow
1. **Lập gói thầu:** PM tạo gói thầu, định nghĩa phạm vi từ BOQ.
2. **Mời thầu:** Hệ thống gửi thông báo cho các đối tác phù hợp trong `Partner Directory`.
3. **Nộp thầu:** Đối tác truy cập `Partner Portal` để điền giá và upload hồ sơ.
4. **Làm rõ:** Hệ thống hỗ trợ Q&A giữa CĐT và Nhà thầu (tương tự luồng RFI).
5. **So sánh giá (Bid-Tabulation):**
   - Hệ thống tự động trích xuất đơn giá từ các bản nộp thầu.
   - Hiển thị bảng so sánh side-by-side với giá dự toán (Budget).
6. **Phê duyệt:** PM chọn nhà thầu trúng thầu, hệ thống tự động sinh `Contract` từ dữ liệu gói thầu.

### 19.4. UI Component Hierarchy

- `BiddingModule/`:
    - `PackageList`: Danh sách các gói thầu đang mở/đã đóng.
    - `PackageForm`: Tạo/Sửa thông tin gói thầu & tiêu chí.
    - `InvitationManager`: Quản lý danh sách đối tác được mời.
    - `BidComparisonTable`: Bảng so sánh đa cột (Vendors vs Criteria).
    - `ApprovalWorkflow`: Form phê duyệt kết quả trúng thầu.

---

## 20. Chi tiết Kỹ thuật Phase 13: PMMS - Material Library

Mô-đun này mở rộng khả năng quản lý vật tư thành thư viện tập trung, tích hợp mô hình BIM và tài liệu kỹ thuật.

### 20.1. Data Models (Types)

```tsx
// src/features/materials/types/material.types.ts

export type SubSystemType = 'LABOR' | 'BUILDING' | 'HVAC' | 'ELECTRICAL' | 'PLUMBING' | 'SUPPORT' | 'PPE';

export interface MaterialSubSystem {
  id: number;
  name: string;
  type: SubSystemType;
  description?: string;
}

export interface MaterialLayer {
  id: number;
  subSystemId: number;
  name: string;
  code: string; // Vd: 1DA, 1DB
  description?: string;
}

export interface Material {
  id: number;
  layerId: number;
  code: string;         // Mã hiệu vật tư (Vd: ST-D20)
  name: string;
  unit: string;
  imageUrl?: string;
  catalogueUrl?: string; // Tệp PDF Catalogue
  description?: string;
  revitFamilyCategory?: string;
  revitCode?: string;
  properties?: string;    // JSON: { "weight": "2kg", "material": "Steel" }
}
```

### 20.2. API Endpoints Expansion

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/material-sub-systems` | Danh sách phân hệ (Labor, HVAC...) |
| `GET` | `/api/v1/material-layers` | Danh sách lớp vật tư (có lọc theo subSystem) |
| `GET` | `/api/v1/materials/search` | Tra cứu vật tư toàn hệ thống với filters |
| `POST` | `/api/v1/materials/{id}/catalogue` | Upload catalogue sản phẩm |

### 20.3. Revit & Library Workflow
1. **Cấu trúc phân tầng:** Người dùng duyệt theo cây thư mục: Phân hệ -> Lớp -> Chi tiết vật tư.
2. **Liên kết Revit:** Khi export/import từ plugin Revit, hệ thống dùng `revitCode` và `revitFamilyCategory` để ánh xạ dữ liệu BIM vào thư viện PMMS.
3. **Tra cứu & Chiết tính:** Thư viện này phục vụ việc lập định mức (Norms) cho các hạng mục BOQ dự án, đảm bảo tính nhất quán về mã hiệu vật tư toàn công ty.

### 20.4. UI Component Hierarchy

- `PMMSModule/`:
    - `SubSystemGrid`: Màn hình dashboard phân loại theo biểu tượng bộ môn.
    - `LayerTable`: Danh sách các lớp (Vd: Phân hệ CTN -> Lớp Ống thép).
    - `MaterialLibrary`: Bảng vật tư chi tiết với Preview hình ảnh và link Catalogue.
    - `BimPropertyPanel`: Hiển thị các thông số đồng bộ từ Revit.

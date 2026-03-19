import { useState } from 'react';
import { useAuthStore } from '../features/auth/stores/authStore';
import { CheckInForm } from '../features/attendance/components/CheckInForm';
import { AttendanceHistory } from '../features/attendance/components/AttendanceHistory';
import { GeofenceMap } from '../features/attendance/components/GeofenceMap';
import { useGeolocation } from '../hooks/useGeolocation';
import { useProjects } from '../features/projects/api/projectApi';

export default function AttendancePage() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<'checkin' | 'history'>('checkin');
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');

  const { position } = useGeolocation();
  const { data: projects } = useProjects();
  const selectedProject = projects?.find(p => p.id === Number(selectedProjectId));

  const isOnlyGuest = user?.roles?.length === 1 && user.roles[0] === 'GUEST';

  if (isOnlyGuest) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <div className="p-4 bg-yellow-500/10 rounded-full text-yellow-500">
          <svg className="size-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Quyền truy cập hạn chế</h2>
        <p className="text-[var(--color-text-muted)] max-w-md">
          Tài khoản GUEST không có quyền thực hiện chấm công hoặc xem lịch sử. Vui lòng liên hệ quản trị viên để được cấp quyền.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Chấm công & Nhân sự</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Chào {user?.fullName}, chấm công hôm nay của bạn</p>
        </div>
      </div>

      <div className="border-b border-[var(--color-border)]">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`pb-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'checkin'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            Vào ca / Tan ca
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'history'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            Lịch sử chấm công
          </button>
        </nav>
      </div>
      {activeTab === 'checkin' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CheckInForm 
              selectedProjectId={selectedProjectId} 
              onProjectChange={setSelectedProjectId} 
            />
          </div>
          
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] h-[500px] overflow-hidden shadow-[var(--shadow-card-theme)]">
            <GeofenceMap 
              projectLocation={selectedProject ? { 
                lat: selectedProject.latitude, 
                lng: selectedProject.longitude, 
                radius: selectedProject.radiusMeters 
              } : undefined}
              userLocation={position ? { lat: position.latitude, lng: position.longitude } : undefined}
              projectName={selectedProject?.name}
            />
          </div>
        </div>
      ) : (
        <AttendanceHistory />
      )}
    </div>
  );
}

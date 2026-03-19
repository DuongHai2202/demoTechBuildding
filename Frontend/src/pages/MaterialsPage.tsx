import { useState, useMemo } from 'react';
import { useMaterials, useCreateMaterial, useUpdateMaterial, useDeleteMaterial, useAllMaterialRequests } from '../features/materials/api/materialApi';
import {
  Square3Stack3DIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  ClipboardDocumentCheckIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import { MaterialForm } from '../features/materials/components/MaterialForm';
import type { Material } from '../features/materials/types/material.types';

export default function MaterialsPage() {
  const { data: materials, isLoading } = useMaterials();
  const createMaterial = useCreateMaterial();
  const updateMaterial = useUpdateMaterial();
  const deleteMaterial = useDeleteMaterial();
  const { data: requests } = useAllMaterialRequests();

  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const filteredMaterials = useMemo(() => {
    if (!materials) return [];
    return materials.filter(m =>
      m.nameVi?.toLowerCase().includes(search.toLowerCase()) ||
      m.unit?.toLowerCase().includes(search.toLowerCase())
    );
  }, [materials, search]);

  const handleCreate = (data: any) => {
    createMaterial.mutate(data, {
      onSuccess: () => setIsFormOpen(false)
    });
  };

  const handleUpdate = (data: any) => {
    if (editingMaterial) {
      updateMaterial.mutate({ id: editingMaterial.id, payload: data }, {
        onSuccess: () => setEditingMaterial(null)
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa vật tư này không?')) {
      deleteMaterial.mutate(id);
    }
  };

  const stats = useMemo(() => ({
    total: materials?.length || 0,
    pendingRequests: requests?.filter(r => r.status === 'PENDING').length || 0,
    totalRequests: requests?.length || 0,
  }), [materials, requests]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Kho Vật Tư</h1>
          <p className="text-sm text-[var(--color-text-muted)]">Quản lý vật tư xây dựng và yêu cầu xuất kho.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Thêm vật tư
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <ArchiveBoxIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.total}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Loại vật tư</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
            <ClipboardDocumentCheckIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.pendingRequests}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Yêu cầu chờ duyệt</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <Square3Stack3DIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{stats.totalRequests}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Tổng yêu cầu</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
        <input
          type="text"
          placeholder="Tìm kiếm vật tư..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-[var(--color-bg)] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ArchiveBoxIcon className="h-12 w-12 text-[var(--color-text-muted)] mb-3" />
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
              {search ? `Không tìm thấy kết quả cho "${search}"` : 'Kho hiện đang trống.'}
            </p>
            {!search && (
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Bắt đầu bằng cách thêm vật tư mới vào hệ thống.</p>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-surface-alt)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">STT</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Hình ảnh</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Tên vật tư</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-muted)]">Đơn vị</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-muted)]">Mã số</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--color-text-muted)]">Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map((m, idx) => (
                <tr key={m.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-alt)] transition-colors">
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="h-10 w-10 rounded-lg overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg)]">
                      {m.imageUrl ? (
                        <img src={m.imageUrl} alt={m.nameVi} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Square3Stack3DIcon className="h-5 w-5 text-[var(--color-text-disabled)]" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--color-text-primary)]">{m.nameVi}</p>
                    {m.descriptionVi && (
                      <p className="text-xs text-[var(--color-text-muted)] truncate max-w-xs">{m.descriptionVi}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center rounded-full bg-[var(--color-info-bg)] px-3 py-1 text-sm font-semibold text-[var(--color-info)]">
                      {m.unit}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-medium text-sm text-[var(--color-text-primary)]">
                      MAT-{m.id.toString().padStart(4, '0')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditingMaterial(m)}
                        className="cursor-pointer p-1.5 rounded-md text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors"
                        title="Chỉnh sửa"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="cursor-pointer p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                        title="Xóa"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Forms Modals */}
      {isFormOpen && (
        <MaterialForm
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleCreate}
          isLoading={createMaterial.isPending}
        />
      )}

      {editingMaterial && (
        <MaterialForm
          initialData={editingMaterial}
          onClose={() => setEditingMaterial(null)}
          onSubmit={handleUpdate}
          isLoading={updateMaterial.isPending}
        />
      )}
    </div>
  );
}

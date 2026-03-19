import { useState } from 'react';
import { toast } from 'sonner';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  BuildingOfficeIcon,
  UserPlusIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  MapPinIcon,
  DocumentTextIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { 
  usePartners, 
  useCreatePartner, 
  useUpdatePartner, 
  useDeletePartner 
} from '../features/partners/api/partnerApi';
import type { Partner, PartnerRequest } from '../features/partners/types/partner.types';
import PartnerLinkModal from './PartnerLinkModal';
import { StatusBadge } from '../components/StatusBadge';
import { useMemo } from 'react';

const INITIAL_FORM: PartnerRequest = { 
  name: '', 
  partnerCode: '', 
  taxCode: '', 
  address: '',
  contactPerson: '',
  phone: '',
  email: '',
  capacityProfile: '',
  status: 'ACTIVE', 
  type: 'CLIENT' 
};

export default function PartnersPage() {
  const { data: partners, isLoading } = usePartners();
  const createPartner = useCreatePartner();
  const updatePartnerMut = useUpdatePartner();
  const deletePartner = useDeletePartner();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PartnerRequest>(INITIAL_FORM);
  const [linkPartner, setLinkPartner] = useState<Partner | null>(null);
  
  // Dynamic Price Table State
  const [priceRows, setPriceRows] = useState<{ id: string; item: string; price: string }[]>([]);

  const addPriceRow = () => {
    setPriceRows([...priceRows, { id: Math.random().toString(36).substr(2, 9), item: '', price: '' }]);
  };

  const removePriceRow = (id: string) => {
    setPriceRows(priceRows.filter(row => row.id !== id));
  };

  const updatePriceRow = (id: string, field: 'item' | 'price', value: string) => {
    setPriceRows(priceRows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    
    const dataToSubmit = { ...form };
    
    // Convert price rows back to JSON object
    const unitPricesObj: Record<string, any> = {};
    priceRows.forEach(row => {
      if (row.item.trim()) {
        unitPricesObj[row.item.trim()] = parseFloat(row.price) || row.price;
      }
    });
    dataToSubmit.unitPrices = unitPricesObj;

    if (editingId) {
      updatePartnerMut.mutate({ id: editingId, partner: dataToSubmit }, {
        onSuccess: () => {
          setForm(INITIAL_FORM);
          setShowForm(false);
          setEditingId(null);
        },
      });
    } else {
      createPartner.mutate(dataToSubmit, {
        onSuccess: () => {
          setForm(INITIAL_FORM);
          setShowForm(false);
        },
      });
    }
  };

  const startEdit = (p: Partner) => {
    setForm({
      name: p.name,
      partnerCode: p.partnerCode || '',
      taxCode: p.taxCode || '',
      address: p.address || '',
      contactPerson: p.contactPerson || '',
      phone: p.phone || '',
      email: p.email || '',
      capacityProfile: p.capacityProfile || '',
      status: p.status,
      type: p.type,
    });
    setEditingId(p.id);
    
    // Convert JSON unit prices to table rows
    if (p.unitPrices && typeof p.unitPrices === 'object') {
      const rows = Object.entries(p.unitPrices).map(([item, price]) => ({
        id: Math.random().toString(36).substr(2, 9),
        item,
        price: String(price)
      }));
      setPriceRows(rows.length > 0 ? rows : []);
    } else {
      setPriceRows([]);
    }

    setShowForm(true);
  };

  const filtered = useMemo(() => {
    return (partners || []).filter(p =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.partnerCode?.toLowerCase().includes(search.toLowerCase()) ||
      p.taxCode?.toLowerCase().includes(search.toLowerCase())
    );
  }, [partners, search]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Quản lý Đối tác
          </h1>
          <p className="text-[var(--color-text-muted)] mt-1">Danh sách khách hàng, nhà thầu và đối tác chiến lược hệ thống.</p>
        </div>
        <button 
          onClick={() => {
            setForm(INITIAL_FORM);
            setPriceRows([]);
            setEditingId(null);
            setShowForm(!showForm);
          }} 
          className="btn-primary"
        >
          {showForm ? 'Đóng biểu mẫu' : (
            <>
              <PlusIcon className="size-4" />
              Thêm đối tác
            </>
          )}
        </button>
      </div>

      {/* Search */}
      {!showForm && (
        <div className="relative max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã hoặc MST..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </div>
      )}

      {/* Expandable Form */}
      {showForm && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg overflow-hidden transition-all animate-in fade-in slide-in-from-top-4 duration-300 mb-6">
          <div className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)] px-6 py-4">
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
              {editingId ? 'Cập nhật đối tác' : 'Thêm đối tác mới'}
            </h3>
          </div>
          <div className="p-6 space-y-8">
            {/* Row 1: Basic & Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] border-b pb-2">Thông tin cơ bản</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block">Tên đối tác *</label>
                    <input
                      placeholder="Tên đối tác"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] bg-[var(--color-surface-alt)]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block">Mã đối tác</label>
                      <input
                        placeholder="Mã số"
                        value={form.partnerCode}
                        onChange={e => setForm(f => ({ ...f, partnerCode: e.target.value }))}
                        className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] bg-[var(--color-surface-alt)]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block">Mã số thuế</label>
                      <input
                        placeholder="MST"
                        value={form.taxCode}
                        onChange={e => setForm(f => ({ ...f, taxCode: e.target.value }))}
                        className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] bg-[var(--color-surface-alt)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] border-b pb-2">Thông tin liên hệ</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block">Người liên hệ</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-text-muted)]" />
                      <input
                        placeholder="Họ và tên"
                        value={form.contactPerson}
                        onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))}
                        className="w-full rounded-md border border-[var(--color-border)] pl-9 pr-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] bg-[var(--color-surface-alt)]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block">Số điện thoại</label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-text-muted)]" />
                      <input
                        placeholder="0xxx xxx xxx"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full rounded-md border border-[var(--color-border)] pl-9 pr-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] bg-[var(--color-surface-alt)]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Entity Selection */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] border-b pb-2">Phân loại & Trạng thái</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block">Loại đối tác</label>
                      <select
                        value={form.type}
                        onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
                        className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none bg-[var(--color-surface-alt)]"
                      >
                        <option value="CLIENT">Khách hàng</option>
                        <option value="CONTRACTOR">Nhà thầu</option>
                        <option value="SUPPLIER">Nhà cung cấp</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block">Trạng thái</label>
                      <select
                        value={form.status}
                        onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
                        className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none bg-[var(--color-surface-alt)]"
                      >
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Ngưng hoạt động</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block">Email công ty</label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--color-text-muted)]" />
                      <input
                        placeholder="email@example.com"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full rounded-md border border-[var(--color-border)] pl-9 pr-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] bg-[var(--color-surface-alt)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Address & Profile */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 pt-4 border-t border-[var(--color-border)] border-dashed">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block">Địa chỉ trụ sở</label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-2.5 size-4 text-[var(--color-text-muted)]" />
                  <textarea
                    placeholder="Địa chỉ số, đường, quận/huyện..."
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    rows={3}
                    className="w-full rounded-md border border-[var(--color-border)] pl-9 pr-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] bg-[var(--color-surface-alt)] resize-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block">Hồ sơ năng lực / Ghi chú</label>
                <div className="relative">
                  <DocumentTextIcon className="absolute left-3 top-2.5 size-4 text-[var(--color-text-muted)]" />
                  <textarea
                    placeholder="Kinh nghiệm, thế mạnh, đánh giá..."
                    value={form.capacityProfile}
                    onChange={e => setForm(f => ({ ...f, capacityProfile: e.target.value }))}
                    rows={3}
                    className="w-full rounded-md border border-[var(--color-border)] pl-9 pr-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] bg-[var(--color-surface-alt)] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Dynamic Unit Price Table */}
            <div className="space-y-4 pt-4 border-t border-[var(--color-border)] border-dashed">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Bảng đơn giá định mức</h4>
                <button
                  type="button"
                  onClick={addPriceRow}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[var(--color-primary)] hover:underline"
                >
                  <PlusIcon className="size-3" />
                  Thêm hạng mục
                </button>
              </div>

              {priceRows.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]">
                      <tr>
                        <th className="px-4 py-2 font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Tên hạng mục / Vật tư</th>
                        <th className="px-4 py-2 font-bold uppercase tracking-wider text-[var(--color-text-muted)] w-48">Đơn giá định mức</th>
                        <th className="px-4 py-2 w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {priceRows.map((row) => (
                        <tr key={row.id} className="hover:bg-[var(--color-surface-alt)]/50">
                          <td className="px-3 py-2">
                            <input
                              value={row.item}
                              onChange={(e) => updatePriceRow(row.id, 'item', e.target.value)}
                              placeholder="VD: Xi măng, Cát, Nhân công xây..."
                              className="w-full bg-transparent p-1 outline-none focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)]/20 rounded"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              value={row.price}
                              onChange={(e) => updatePriceRow(row.id, 'price', e.target.value)}
                              placeholder="0.00"
                              className="w-full bg-transparent p-1 outline-none focus:bg-white focus:ring-1 focus:ring-[var(--color-primary)]/20 rounded font-mono"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => removePriceRow(row.id)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                              <XMarkIcon className="size-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div 
                  onClick={addPriceRow}
                  className="border-2 border-dashed border-[var(--color-border)] rounded-lg p-6 text-center cursor-pointer hover:bg-[var(--color-surface-alt)] transition-colors"
                >
                  <p className="text-sm text-[var(--color-text-muted)]">Chưa có đơn giá nào. Nhấn "Thêm hạng mục" để khởi tạo.</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button 
                onClick={() => {
                  setShowForm(false);
                  setPriceRows([]);
                  setEditingId(null);
                }} 
                className="btn-outline px-6"
              >
                Hủy
              </button>
              <button 
                onClick={handleSubmit} 
                className="btn-primary px-8" 
                disabled={createPartner.isPending || updatePartnerMut.isPending}
              >
                {(createPartner.isPending || updatePartnerMut.isPending) ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Lưu đối tác')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-surface-alt)]/50 border-b border-[var(--color-border)]">
                <th className="px-6 py-5 text-left font-black text-[var(--color-text-secondary)] uppercase tracking-widest text-[10px]">Đối tác</th>
                <th className="px-6 py-5 text-left font-black text-[var(--color-text-secondary)] uppercase tracking-widest text-[10px]">Liên hệ</th>
                <th className="px-6 py-5 text-left font-black text-[var(--color-text-secondary)] uppercase tracking-widest text-[10px]">Mã / MST</th>
                <th className="px-6 py-5 text-left font-black text-[var(--color-text-secondary)] uppercase tracking-widest text-[10px]">Loại / Trạng thái</th>
                <th className="px-6 py-5 text-right font-black text-[var(--color-text-secondary)] uppercase tracking-widest text-[10px]">Tác vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-[var(--color-text-muted)] italic">Đang tải danh sách đối tác...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <BuildingOfficeIcon className="size-16 mx-auto mb-4 text-[var(--color-primary)]/20" />
                    <p className="text-[var(--color-text-muted)] font-medium">Không tìm thấy đối tác phù hợp.</p>
                    <button onClick={() => {setForm(INITIAL_FORM); setShowForm(true);}} className="text-[var(--color-primary)] text-sm mt-2 hover:underline">Thêm mới</button>
                  </td>
                </tr>
              ) : filtered.map((p: Partner) => (
                <tr 
                  key={p.id} 
                  onClick={() => startEdit(p)}
                  className="group hover:bg-[var(--color-primary-light)]/30 transition-all duration-200 cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] font-black text-lg shrink-0 shadow-sm border border-[var(--color-primary)]/10">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-black text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors tracking-tight">{p.name}</div>
                        <div className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                          <MapPinIcon className="size-3" />
                          <span className="truncate max-w-[200px]">{p.address || 'Chưa cập nhật địa chỉ'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1.5">
                      <div className="text-[var(--color-text-primary)] font-black text-xs flex items-center gap-1.5">
                        <UserIcon className="size-3.5 text-[var(--color-primary)]/70" />
                        {p.contactPerson || '—'}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5 font-medium">
                        <PhoneIcon className="size-3.5 text-[var(--color-primary)]/70" />
                        {p.phone || '—'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1.5">
                      <div className="text-[var(--color-text-primary)] font-mono text-xs font-bold uppercase tracking-tight">Mã: {p.partnerCode || '—'}</div>
                      <div className="text-[var(--color-text-muted)] font-mono text-[11px] font-medium tracking-tight">MST: {p.taxCode || '—'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-2">
                      <div className="w-fit"><StatusBadge status={p.type} /></div>
                      <div className="w-fit"><StatusBadge status={p.status} /></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); startEdit(p); }}
                        className="p-2 rounded-lg text-[var(--color-text-primary)] hover:bg-[var(--color-surface-alt)] transition-colors"
                        title="Sửa thông tin"
                      >
                        <PencilIcon className="size-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toast.info('Tính năng lịch sử hợp tác đang phát triển'); }}
                        className="p-2 rounded-lg text-[var(--color-text-primary)] hover:bg-[var(--color-surface-alt)] transition-colors"
                        title="Lịch sử hợp tác"
                      >
                        <DocumentTextIcon className="size-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setLinkPartner(p); }}
                        className="p-2 rounded-lg text-[var(--color-text-primary)] hover:bg-[var(--color-surface-alt)] transition-colors"
                        title="Gán tài khoản portal"
                      >
                        <UserPlusIcon className="size-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); if (confirm(`Xóa đối tác "${p.name}"?`)) deletePartner.mutate(p.id); }}
                        className="p-2 rounded-lg text-[var(--color-text-primary)] hover:bg-[var(--color-danger-bg)] hover:text-red-600 transition-colors"
                        title="Xóa đối tác"
                      >
                        <TrashIcon className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {linkPartner && (
        <PartnerLinkModal 
          partner={linkPartner} 
          onClose={() => setLinkPartner(null)} 
        />
      )}
    </div>
  );
}

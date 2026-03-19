import { useState } from 'react';
import { PackageList } from './PackageList';
import { PackageForm } from './PackageForm';
import { BiddingPackageDetail } from './BiddingPackageDetail';
import type { BiddingPackage } from '../types/bidding.types';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

export function BiddingModule({ projectId }: { projectId: number }) {
  const [view, setView] = useState<'LIST' | 'DETAIL' | 'COMPARE'>('LIST');
  const [selectedPackage, setSelectedPackage] = useState<BiddingPackage | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSelect = (pkg: BiddingPackage) => {
    setSelectedPackage(pkg);
    setView('DETAIL');
  };

  const handleCompare = (pkg: BiddingPackage) => {
    setSelectedPackage(pkg);
    setView('COMPARE');
  };

  return (
    <div className="p-6">
      {view !== 'LIST' && (
        <button 
          onClick={() => setView('LIST')}
          className="mb-6 flex items-center gap-1.5 text-sm font-bold text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          <ChevronLeftIcon className="size-4" />
          Quay lại danh sách
        </button>
      )}

      {view === 'LIST' && (
        <PackageList 
          projectId={projectId} 
          onSelect={handleSelect}
          onCompare={handleCompare}
          onCreate={() => setShowForm(true)}
        />
      )}

      {(view === 'COMPARE' || view === 'DETAIL') && selectedPackage && (
        <BiddingPackageDetail 
          biddingPackage={selectedPackage} 
          onClose={() => setView('LIST')} 
        />
      )}

      {showForm && (
        <PackageForm 
          projectId={projectId} 
          onClose={() => setShowForm(false)} 
        />
      )}
    </div>
  );
}

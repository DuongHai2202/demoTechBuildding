import { useEffect, useState } from 'react';
import { useRfi, useRfiComments, useAddRfiComment, useUpdateRfiStatus } from '../api/rfiApi';
import { XMarkIcon, PaperAirplaneIcon, CheckIcon } from '@heroicons/react/24/outline';
import { StatusBadge } from '../../../components/StatusBadge';
import { useAuthStore } from '../../auth/stores/authStore';
import { useActionDialog } from '../../../components/ui/ActionDialog';
import { Pagination } from '../../../components/ui/Pagination';

const COMMENT_PAGE_SIZE = 10;

export function RfiDetailModal({ rfiId, onClose }: { rfiId: number, onClose: () => void }) {
  const { confirm } = useActionDialog();
  const { data: rfi, isLoading } = useRfi(rfiId);
  const { data: comments } = useRfiComments(rfiId);
  const addComment = useAddRfiComment();
  const updateStatus = useUpdateRfiStatus();
  const [newComment, setNewComment] = useState('');
  const [commentPage, setCommentPage] = useState(1);
  const currentUser = useAuthStore(state => (state as any).user);
  const commentList = comments || [];
  const totalCommentPages = Math.max(1, Math.ceil(commentList.length / COMMENT_PAGE_SIZE));
  const currentCommentPage = Math.min(commentPage, totalCommentPages);
  const paginatedComments = commentList.slice((currentCommentPage - 1) * COMMENT_PAGE_SIZE, currentCommentPage * COMMENT_PAGE_SIZE);

  useEffect(() => {
    setCommentPage(1);
  }, [rfiId, comments?.length]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;
    
    addComment.mutate({
      rfiId,
      content: newComment,
      userId: Number(currentUser.id)
    }, {
      onSuccess: () => setNewComment('')
    });
  };

  const handleResolve = async () => {
    if (await confirm({
      title: 'Đánh dấu RFI đã giải quyết',
      description: 'RFI sẽ chuyển sang trạng thái đã giải quyết. Bạn có chắc muốn tiếp tục?',
      confirmLabel: 'Đánh dấu đã giải quyết',
      variant: 'success',
    })) {
      updateStatus.mutate({ id: rfiId, status: 'RESOLVED' });
    }
  };

  if (isLoading || !rfi) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl h-[80vh] flex flex-col rounded-2xl bg-[var(--color-surface)] shadow-2xl border border-[var(--color-border)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]/50 px-6 py-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">RFI #{rfi.id}</span>
              <StatusBadge label={rfi.status} variant="info" />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">{rfi.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {rfi.status === 'OPEN' && (
              <button 
                onClick={handleResolve}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 transition-colors"
              >
                <CheckIcon className="size-4" />
                Giải quyết
              </button>
            )}
            <button onClick={onClose} className="rounded-lg p-1 hover:bg-[var(--color-border)] transition-colors">
              <XMarkIcon className="size-5 text-[var(--color-text-muted)]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
              <h4 className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase mb-2">Câu hỏi / Vấn đề</h4>
              <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">{rfi.question}</p>
            </div>

            {rfi.suggestedSolution && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4">
                <h4 className="text-[10px] font-bold text-indigo-500 uppercase mb-2">Đề xuất xử lý</h4>
                <p className="text-sm text-indigo-900 leading-relaxed">{rfi.suggestedSolution}</p>
              </div>
            )}
            
            {rfi.sheetNumber && (
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                <span>Liên quan bản vẽ:</span>
                <span className="font-bold text-[var(--color-primary)]">{rfi.sheetNumber}</span>
                {rfi.coordX && (
                  <span className="text-[10px]">({rfi.coordX.toFixed(1)}, {rfi.coordY?.toFixed(1)})</span>
                )}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
            <h4 className="text-sm font-bold text-[var(--color-text-primary)]">Thảo luận kỹ thuật</h4>
            <div className="space-y-4">
              {commentList.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)] italic">Chưa có trao đổi nào.</p>
              ) : (
                paginatedComments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="size-8 rounded-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
                      {comment.userAvatar ? (
                        <img src={comment.userAvatar} className="size-full rounded-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-[var(--color-text-secondary)]">{comment.userName.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[var(--color-text-primary)]">{comment.userName}</span>
                        <span className="text-[10px] text-[var(--color-text-muted)]">{new Date(comment.createdAt).toLocaleString('vi-VN')}</span>
                      </div>
                      <div className="rounded-2xl rounded-tl-none bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text-secondary)]">
                        {comment.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <Pagination
                page={currentCommentPage}
                pageSize={COMMENT_PAGE_SIZE}
                total={commentList.length}
                onPageChange={setCommentPage}
                itemLabel="trao đổi"
                ariaLabel="Phân trang thảo luận kỹ thuật"
              />
            </div>
          </div>
        </div>

        {/* Comment Input */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface-alt)]/30">
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input 
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Nhập nội dung trao đổi..."
              className="flex-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm outline-none focus:border-[var(--color-primary)] transition-all"
            />
            <button 
              type="submit"
              disabled={!newComment.trim() || addComment.isPending}
              className="size-9 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <PaperAirplaneIcon className="size-4 -rotate-45" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

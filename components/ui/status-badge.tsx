import { TransactionStatus } from '@/lib/types';
import { cn, getStatusColor } from '@/lib/utils';

interface StatusBadgeProps {
  status: TransactionStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusLabels: Record<TransactionStatus, string> = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getStatusColor(status),
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
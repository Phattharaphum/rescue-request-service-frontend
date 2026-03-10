import React from 'react';
import { cn } from '@/lib/utils/cn';

interface TableProps {
  children: React.ReactNode;
  striped?: boolean;
  className?: string;
}

interface TableSectionProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  colSpan?: number;
}

const alignClass = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const StripedContext = React.createContext(false);

export function Table({ children, striped = false, className }: TableProps) {
  return (
    <StripedContext.Provider value={striped}>
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className={cn('w-full min-w-full text-sm', className)}>
          {children}
        </table>
      </div>
    </StripedContext.Provider>
  );
}

export function TableHeader({ children, className }: TableSectionProps) {
  return (
    <thead className={cn('bg-gray-50 border-b border-gray-200', className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className }: TableSectionProps) {
  const striped = React.useContext(StripedContext);
  return (
    <tbody
      className={cn(
        'divide-y divide-gray-100 bg-white',
        striped && '[&>tr:nth-child(even)]:bg-gray-50',
        className,
      )}
    >
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, onClick }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'transition-colors',
        onClick && 'cursor-pointer hover:bg-teal-50',
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className, align = 'left' }: TableHeadProps) {
  return (
    <th
      scope="col"
      className={cn(
        'px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap',
        alignClass[align],
        className,
      )}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className, align = 'left', colSpan }: TableCellProps) {
  return (
    <td
      colSpan={colSpan}
      className={cn('px-4 py-3 text-gray-700 align-middle', alignClass[align], className)}
    >
      {children}
    </td>
  );
}

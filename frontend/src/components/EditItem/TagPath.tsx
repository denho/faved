import React from 'react';
import { cn, getColorClass } from '@/lib/utils.ts';

export const TagPath = ({
  tag,
  showLast,
  className,
}: {
  tag: { label: string; color: string };
  showLast?: boolean;
  className?: string;
}) => {
  const slashPlaceholder = '__SLASH__';
  const segments = tag.label
    .replaceAll('\\/', slashPlaceholder)
    .split('/')
    .filter((s) => s.trim().length > 0)
    .map((s) => s.replaceAll(slashPlaceholder, '/'));
  const colorClass = getColorClass(tag.color);

  return (
    <span className="flex flex-nowrap items-center justify-start gap-2">
      <span className={cn('h-2.5 w-2.5 flex-none rounded-full', colorClass, className || '')}></span>
      <span className={cn('break-words', showLast ? '-space-x-0.5' : 'space-x-0')}>
        {segments.map((segment, index) => (
          <React.Fragment key={index}>
            <span>{!showLast || index === segments.length - 1 ? segment : '.'}</span>
            {index !== segments.length - 1 && <span className="bold text-gray-400"> / </span>}
          </React.Fragment>
        ))}
      </span>
    </span>
  );
};

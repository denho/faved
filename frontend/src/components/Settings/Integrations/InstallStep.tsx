import React from 'react';
import { Badge } from '@/components/ui/badge.tsx';

export const InstallStep = ({ text, index }: { text: React.ReactNode; index: number }) => (
  <div className="flex items-start gap-3">
    <Badge
      variant="outline"
      className="bg-background text-primary mt-0 flex h-6 w-6 shrink-0 items-center justify-center font-semibold"
    >
      {index + 1}
    </Badge>
    <p className="text-foreground text-sm leading-relaxed">{text}</p>
  </div>
);

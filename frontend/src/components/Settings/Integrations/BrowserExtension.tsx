import React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { IconPuzzle } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge.tsx';

export const BrowserExtension = () => {
  return (
    <Card className="opacity-60 transition-opacity hover:opacity-100">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <div className="bg-muted mt-1 flex h-10 w-10 items-center justify-center rounded-lg">
          <IconPuzzle className="text-muted-foreground h-6 w-6" />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Browser Extension</CardTitle>
            <Badge variant="secondary" className="font-normal">
              Coming soon
            </Badge>
          </div>
          <CardDescription>A dedicated extension for your favorite browser to save links even faster.</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
};

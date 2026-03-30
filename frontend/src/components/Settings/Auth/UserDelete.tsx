'use client';

import { Button } from '@/components/ui/button.tsx';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { useContext } from 'react';
import { StoreContext } from '@/store/storeContext.ts';

export function UserDelete() {
  const store = useContext(StoreContext);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Disable Authentication</CardTitle>
        <CardDescription>
          Disabling authentication will remove your user account and disable login functionality.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={store.deleteUser} variant="destructive" className="w-full">
          Disable Authentication
        </Button>
      </CardFooter>
    </Card>
  );
}

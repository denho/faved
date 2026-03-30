'use client';

import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input.tsx';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';
import * as React from 'react';
import { StoreContext } from '@/store/storeContext.ts';

const formSchema = z.object({
  username: z
    .string()
    .min(2, { message: 'Username must be at least 2 characters.' })
    .max(30, { message: 'Username must be at most 30 characters.' }),
});

export const UserUsernameEdit = () => {
  const store = React.useContext(StoreContext);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: store.user.username ?? '',
    },
  });
  const submit = async (values: z.infer<typeof formSchema>) => {
    return await store.updateUsername(values);
  };
  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="space-y-5">
          <CardHeader>
            <CardTitle className="text-lg">Change Username</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Username" autoComplete="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Spinner />}
              Update Username
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

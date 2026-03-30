'use client';

import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Input } from '@/components/ui/input.tsx';
import { useContext } from 'react';
import { StoreContext } from '@/store/storeContext.ts';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';

const formSchema = z
  .object({
    username: z
      .string()
      .min(2, { message: 'Username must be at least 2 characters.' })
      .max(30, { message: 'Username must be at most 30 characters.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    confirm_password: z.string().min(6, { message: 'Password confirmation must be at least 6 characters.' }),
  })
  .refine(
    (data: { password: string; confirm_password: string }) => {
      return data.password === data.confirm_password;
    },
    {
      message: 'Passwords do not match.',
      path: ['confirm_password'],
    }
  );

export const UserCreate = ({ onSuccess }: { onSuccess?: () => void }) => {
  const store = useContext(StoreContext);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      confirm_password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const success = await store.createUser(values);
    if (success && onSuccess) {
      onSuccess();
    }
  };
  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardHeader>
            <CardTitle className="text-lg">Create User Account</CardTitle>
            <CardDescription>
              Create a user account to enable authentication for your Faved instance. Without a user account,
              authentication will be disabled and anyone with access to the instance can use it.
            </CardDescription>
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
            <div className="flex flex-col gap-3">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" placeholder="Password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-3">
              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" placeholder="Confirm Password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Spinner />}
              Create User
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

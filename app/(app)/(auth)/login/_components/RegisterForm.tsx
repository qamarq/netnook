"use client"

import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import PlaceholderImage from '@/public/assets/placeholder.svg';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from 'zod';
import { registerSchema } from '@/schemas';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/Auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useTransition } from 'react';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';

export function RegisterForm() {
    const { create } = useAuth()
    const searchParams = useSearchParams()
    const redirect = useRef(searchParams.get('redirect'))
    const router = useRouter()
    const [isLoading, startTransition] = useTransition()
    
    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            passwordConfirm: "",
        },
    })

    async function onSubmit(values: z.infer<typeof registerSchema>) {
        startTransition(async () => {
            try {
                await create(values)
                if (redirect?.current) router.push(redirect.current as string)
                else router.push('/login?registered=true')
            } catch (err) {
                console.log(err)
                toast.error('Wpisz poprawne dane rejestracji')
            }
        })
    }

    return (
        <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
            <div className="flex items-center justify-center py-12 backdrop-blur-md border rounded-l-lg">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold">Rejestracja</h1>
                        <p className="text-balance text-muted-foreground">
                            Enter your email below to login to your account
                        </p>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                            <div className="grid gap-2">
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Imie i nazwisko</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" type='name' autoComplete='name' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid gap-2">
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="m@example.com" type='email' autoComplete='email' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid gap-2">
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center">
                                                <FormLabel>Hasło</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Input type='password' autoComplete='new-password' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid gap-2">
                                <FormField
                                    disabled={isLoading}
                                    control={form.control}
                                    name="passwordConfirm"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center">
                                                <FormLabel>Powtórz hasło</FormLabel>
                                            </div>
                                            <FormControl>
                                                <Input type='password' autoComplete='new-password' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Icons.Loader className="w-4 h-4 mr-2 animate-spin" />}
                                Zarejestruj się
                            </Button>
                        </form>
                    </Form>
                    <div className="mt-2 text-center text-sm">
                        Posiadasz już konto?{' '}
                        <Link href="/login" className="underline">
                            Wróć do logowania
                        </Link>
                    </div>
                </div>
            </div>
            <div className="hidden bg-slate-100 lg:block rounded-r-lg">
                <Image
                    src={PlaceholderImage}
                    alt="Image"
                    width="1920"
                    height="1080"
                    className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale rounded-r-lg"
                />
            </div>
        </div>
    );
}

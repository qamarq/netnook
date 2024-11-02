"use client"

import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FcGoogle } from "react-icons/fc";

import PlaceholderImage from '@/public/assets/placeholder.svg';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from 'zod';
import { loginSchema } from '@/schemas';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/Auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useTransition } from 'react';
import { toast } from 'sonner';
import { Icons } from '@/components/icons';

export function LoginForm() {
    const { login } = useAuth()
    const searchParams = useSearchParams()
    const redirect = useRef(searchParams.get('callbackUrl'))
    const registered = useRef(searchParams.get('registered'))
    const router = useRouter()
    const [isLoggingIn, startTransition] = useTransition()
    
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof loginSchema>) {
        startTransition(async () => {
            try {
                await login(values)
                if (redirect?.current) {
                    router.push(redirect.current as string)
                } else {
                    router.push('/konto')
                }
            } catch (err) {
                console.log(err)
                toast.error('Wpisz poprawne dane logowania')
            }
        })
    }

    return (
        <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
            <div className="flex items-center justify-center py-12 backdrop-blur-md border rounded-l-lg">
                <div className="mx-auto grid w-[350px] gap-6">
                    {registered.current && (
                        <div className='p-3 bg-emerald-50 rounded-xl text-balance'>
                            <p className='text-emerald-900 font-semibold leading-5 text-sm'>Pomyślnie zarejestrowano. Sprawdź skrzynkę pocztową, aby zweryfikować.</p>
                        </div>  
                    )}
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold">Logowanie</h1>
                        <p className="text-balance text-muted-foreground">
                            Enter your email below to login to your account
                        </p>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                            <div className="grid gap-2">
                                <FormField
                                    disabled={isLoggingIn}
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input placeholder="m@example.com" type='email' autoComplete='email' {...field} />
                                            </FormControl>
                                            {/* <FormDescription>
                                                This is your public display name.
                                            </FormDescription> */}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                /> */}
                            </div>
                            <div className="grid gap-2">
                                <FormField
                                    disabled={isLoggingIn}
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center">
                                                <FormLabel>Hasło</FormLabel>
                                                <Link
                                                    href="/forgot-password"
                                                    className="ml-auto inline-block text-sm underline">
                                                    Zapomniałeś hasło?
                                                </Link>
                                            </div>
                                            <FormControl>
                                                <Input type='password' autoComplete='password' {...field} />
                                            </FormControl>
                                            {/* <FormDescription>
                                                This is your public display name.
                                            </FormDescription> */}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <Link
                                        href="/forgot-password"
                                        className="ml-auto inline-block text-sm underline">
                                        Forgot your password?
                                    </Link>
                                </div>
                                <Input id="password" type="password" required /> */}
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoggingIn}>
                                {isLoggingIn && <Icons.Loader className="mr-2 w-4 h-4 animate-spin" />}
                                Zaloguj się
                            </Button>
                            <Button type='button' variant="outline" className="w-full" disabled={isLoggingIn}>
                                <FcGoogle className='mr-2 w-4 h-4' />
                                Zaloguj się z Google
                            </Button>
                        </form>
                    </Form>
                    <div className="mt-4 text-center text-sm">
                        Nie masz konta?{' '}
                        <Link href="/register" className="underline">
                            Załóż je teraz
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

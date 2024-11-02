"use client"

import { Icons } from '@/components/icons';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import LogoutBtn from '../../_components/LogoutBtn';

export default function NavbarNavigation({ count }: { count: number }) {
    const path = usePathname();
    
    return (
        <nav className="flex flex-col gap-1 h-full">
            <div className='mx-2 px-3 py-1'>
                <h1 className='font-semibold text-xl'>Twoje konto</h1>
            </div>
            <Separator className="my-3" />
            <Link href={"/konto"}>
                <span className={cn( 'mx-2 group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground', path === "/konto" ? 'bg-accent' : 'transparent', )}>
                    <Icons.User className="mr-2 h-4 w-4 min-w-4" />
                    <span>Edytuj profil</span>
                </span>
            </Link>
            <Link href={"/konto/powiadomienia"}>
                <span className={cn( 'mx-2 group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground', path === "/konto/powiadomienia" ? 'bg-accent' : 'transparent', )}>
                    <Icons.Notification className="mr-2 h-4 w-4 min-w-4" />
                    <span>Powiadomienia</span>

                    <div className='w-full flex items-center justify-end'><span className={cn('border py-[2px] px-2 rounded-full bg-white text-black text-xs font-semibold leading-none', { 'text-white bg-primary': count > 0 })}>{count}</span></div>
                </span>
            </Link>
            <Separator className="my-3" />
            <Link href={"/konto/zabezpieczenia"}>
                <span className={cn( 'mx-2 group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground', path === "/konto/zabezpieczenia" ? 'bg-accent' : 'transparent', )}>
                    <Icons.Shield className="mr-2 h-4 w-4 min-w-4" />
                    <span>Zabezpieczenia</span>
                </span>
            </Link>
            <Link href={"/konto/metody-platnosci"}>
                <span className={cn( 'mx-2 group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground', path === "/konto/metody-platnosci" ? 'bg-accent' : 'transparent', )}>
                    <Icons.CreditCard className="mr-2 h-4 w-4 min-w-4" />
                    <span>Metody płatności</span>
                </span>
            </Link>
            <Link href={"/konto/zamowienia"}>
                <span className={cn( 'mx-2 group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground', path === "/konto/zamowienia" ? 'bg-accent' : 'transparent', )}>
                    <Icons.Package className="mr-2 h-4 w-4 min-w-4" />
                    <span>Zamówienia</span>
                </span>
            </Link>
            <Link href={"/konto/netnookpro"}>
                <span className={cn( 'mx-2 group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground', path === "/konto/netnookpro" ? 'bg-accent' : 'transparent', )}>
                    <Icons.Logo className="mr-2 h-4 w-4 min-w-4" />
                    <span>NetNook Pro</span>
                </span>
            </Link>
            {/* <div className='flex-grow' /> */}
            <Separator className="my-3" />
            <Link href={"/konto/ustawienia"}>
                <span className={cn( 'mx-2 group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground', path === "/konto/ustawienia" ? 'bg-accent' : 'transparent', )}>
                    <Icons.Settings className="mr-2 h-4 w-4 min-w-4" />
                    <span>Ustawienia</span>
                </span>
            </Link>
            <LogoutBtn>
                <span className={cn( 'mx-2 group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground', path === "/" ? 'bg-accent' : 'transparent', )}>
                    <Icons.Logout className="mr-2 h-4 w-4 min-w-4" />
                    <span>Wyloguj się</span>
                </span>
            </LogoutBtn>
        </nav>
    );
}

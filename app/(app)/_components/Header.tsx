'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import React from 'react';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Category } from '@/payload-types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/Auth';
import LogoutBtn from './LogoutBtn';
import CartComponent from './CartComponent';

export default function Header({ categories }: { categories: Category[] }) {
    const { user } = useAuth()
    
    return (
        <div className="w-full fixed top-0 inset-x-0 bg-white/20 backdrop-blur-md border-b border-slate-200 z-50">
            <div className="w-full max-w-7xl mx-auto p-3 flex items-center">
                <Link href="/" className="flex items-center gap-2">
                    <Icons.Logo className="w-8 h-8 text-slate-900" />
                    <h1 className="tracking-tight text-2xl font-bold text-slate-900">
                        NetNook
                    </h1>
                </Link>
                <div className="grow px-4">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>
                                    Polecane produkty
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                                        <li className="row-span-3">
                                            <NavigationMenuLink asChild>
                                                <a
                                                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                                    href="/">
                                                    <Icons.Logo className="h-6 w-6" />
                                                    <div className="mb-2 mt-4 text-lg font-medium">
                                                        shadcn/ui
                                                    </div>
                                                    <p className="text-sm leading-tight text-muted-foreground">
                                                        Beautifully designed
                                                        components that you can
                                                        copy and paste into your
                                                        apps. Accessible.
                                                        Customizable. Open
                                                        Source.
                                                    </p>
                                                </a>
                                            </NavigationMenuLink>
                                        </li>
                                        <ListItem
                                            href="/docs"
                                            title="Introduction">
                                            Re-usable components built using
                                            Radix UI and Tailwind CSS.
                                        </ListItem>
                                        <ListItem
                                            href="/docs/installation"
                                            title="Installation">
                                            How to install dependencies and
                                            structure your app.
                                        </ListItem>
                                        <ListItem
                                            href="/docs/primitives/typography"
                                            title="Typography">
                                            Styles for headings, paragraphs,
                                            lists...etc
                                        </ListItem>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger>
                                    Kategorie
                                </NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                                        {categories.map((category) => (
                                            <ListItem
                                                key={category.title}
                                                title={category.title || ""}
                                                href={`/sklep?category=${category.id}`}>
                                                {category.description}
                                            </ListItem>
                                        ))}
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link href="/sklep" legacyBehavior passHref>
                                    <NavigationMenuLink
                                        className={navigationMenuTriggerStyle()}>
                                        Sklep
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link href="/onas" legacyBehavior passHref>
                                    <NavigationMenuLink
                                        className={navigationMenuTriggerStyle()}>
                                        O nas
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link href="/kontakt" legacyBehavior passHref>
                                    <NavigationMenuLink
                                        className={navigationMenuTriggerStyle()}>
                                        Kontakt
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                            {user?.roles?.includes("admin") && (
                                <NavigationMenuItem>
                                    <Link href="/admin" legacyBehavior passHref>
                                        <NavigationMenuLink
                                            className={navigationMenuTriggerStyle()}>
                                            Panel administracyjny
                                        </NavigationMenuLink>
                                    </Link>
                                </NavigationMenuItem>
                            )}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
                <div className="flex items-center gap-2">
                    <Button size={"icon"} variant={"secondary"}>
                        <Icons.Search className="w-5 h-5" />
                    </Button>
                    <Button size={"icon"} variant={"secondary"}>
                        <Icons.Heart className="w-5 h-5" />
                    </Button>
                    <CartComponent />
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Avatar className='cursor-pointer'>
                                    <AvatarImage src={user.avatar?.url || ""} alt={user.name || ""} />
                                    <AvatarFallback className='font-semibold'>{user.name?.split(" ")[0].slice(0,1)}{user.name?.split(" ")[1].slice(0,1)}</AvatarFallback>
                                </Avatar>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={"end"} className='z-10'>
                                <DropdownMenuLabel>Moje konto</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <Link href="/konto"><DropdownMenuItem>Profil</DropdownMenuItem></Link>
                                <DropdownMenuItem>Zamówienia</DropdownMenuItem>
                                <DropdownMenuItem>Ustawienia</DropdownMenuItem>
                                <LogoutBtn><DropdownMenuItem>Wyloguj się</DropdownMenuItem></LogoutBtn>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Link href="/login">
                            <Button>Zaloguj się</Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

const ListItem = React.forwardRef<
    React.ElementRef<'a'>,
    React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                        className
                    )}
                    {...props}>
                    <div className="text-sm font-medium leading-none">
                        {title}
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = 'ListItem';

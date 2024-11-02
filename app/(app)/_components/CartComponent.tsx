"use client"

import React from 'react'
import { Separator } from '@/components/ui/separator';
import EmptyCartImage from "@/public/assets/no_cart.png"
import Image from 'next/image';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useCart } from '@/hooks/Cart';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { getPriceFromJSON } from '@/lib/utils';
import Link from 'next/link';

export default function CartComponents() {
    const { hasInitializedCart, cart, cartTotal, deleteItemFromCart, itemsInCart } = useCart()

    const handleDelete = (product: any) => {
        deleteItemFromCart(product)
    }
    
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size={"icon"} variant={"secondary"} className='relative'>
                    <Icons.Cart className="w-5 h-5" />
                    {hasInitializedCart && cart?.items && cart.items.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground rounded-full text-xs px-1">
                            {itemsInCart}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className='flex-grow max-w-full sm:max-w-full md:max-w-md lg:max-w-lg'>
                <SheetHeader>
                    <SheetTitle>Twój koszyk</SheetTitle>
                    <Separator />
                </SheetHeader>
                {hasInitializedCart && cart && cart.items && cart.items.length > 0 ? (
                    <div className='flex flex-grow h-full items-center flex-col'>
                        <div className='flex flex-col gap-5 w-full mt-4'>
                            {cart.items.map((item) => {
                                if (!item.product || typeof item.product === "string") return null

                                return (
                                    <div key={item.product.id} className='flex items-center w-full'>
                                        <Image src={item.product.image?.thumbnailURL || ''} alt={item.product.title} width={80} height={80} />
                                        <div className='grow ml-2'>
                                            <h1 className='text-md font-semibold tracking-tight line-clamp-2'>{item.product.title}</h1>
                                            {/* <h2 className='text-xs text-muted-foreground text-medium'>{item.product.producer.title}</h2> */}

                                            <div onClick={() => handleDelete(item.product)} className='mt-1 flex items-center gap-1 text-xs text-muted-foreground cursor-pointer font-semibold'><Icons.X className='h-3 w-3' /> Usuń produkt</div>
                                        </div>
                                        <div className='flex flex-col items-end ml-3'>
                                            <p className='font-semibold'>{getPriceFromJSON(item.product.priceJSON)}</p>
                                            <p>{item.quantity} szt.</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <Separator className='mt-5' />
                        <div className='flex items-center justify-between w-full mt-5'>
                            <h1 className='text-xl font-semibold'>Suma: {cartTotal.formatted}</h1>
                            <SheetClose asChild>
                                <Link href="/koszyk">
                                    <Button>Przejdź do kasy</Button>
                                </Link>
                            </SheetClose>
                        </div>
                    </div>
                ) : (
                    <div className='flex flex-grow h-full items-center justify-center flex-col'>
                        <Image src={EmptyCartImage} alt='Pusty koszyk' />
                        <h1 className='mt-3 text-xl font-semibold tracking-tight'>Twój koszyk jest pusty</h1>
                        <h2 className='mt-1 text-sm text-muted-foreground'>Dodaj jakieś produkty, aby przejść dalej</h2>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}

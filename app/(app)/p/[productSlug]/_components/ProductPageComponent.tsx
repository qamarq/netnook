"use client"

import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel'
import { Product } from '@/payload-types'
import Image from 'next/image'
import { type CarouselApi } from "@/components/ui/carousel"
import React from 'react'
import StarsComponent from '@/components/stars'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { specitifactionTypes } from '@/constants'
import { Icons } from '@/components/icons'
import { cn, getPriceFromJSON } from '@/lib/utils'
import { NumberInput } from '@tremor/react';
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/Cart'
import { toast } from 'sonner'

export default function ProductPageComponent({ product }: { product: Product }) {
    const [added, setAdded] = React.useState(false)
    const [api, setApi] = React.useState<CarouselApi>()
    const [current, setCurrent] = React.useState(0)
    const [count, setCount] = React.useState(0)
    const [currentQuantity, setCurrentQuantity] = React.useState(1)
    const { addItemToCart } = useCart()

    const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation()
        e.preventDefault()
        if (addItemToCart) {
            addItemToCart({
                product: product,
                quantity: currentQuantity,
            })
            toast.success('Dodano produkt do koszyka')
        }
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    React.useEffect(() => {
        if (!api) {
            return
        }
     
        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap() + 1)
     
        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1)
        })
    }, [api])

    return (
        <div className='pt-20'>
            <section className='mx-auto max-w-7xl'>
                <div className='flex items-center justify-between'>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/">NetNook</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/sklep">Sklep</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            {product.categories?.map((category, index) => {
                                return (
                                    <React.Fragment key={category.id}>
                                        <BreadcrumbItem>
                                            <BreadcrumbLink href={`/sklep?category=${category.id}`}>{category.title}</BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator />
                                    </React.Fragment>
                                )
                            })}
                            <BreadcrumbItem>
                                <BreadcrumbPage>{product.title}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className='mt-10 flex gap-10'>
                    <div className='w-[500px] min-h-[500px]'>
                        <Carousel className="w-full" setApi={setApi}>
                            <CarouselContent>
                                <CarouselItem>
                                    <div className="border rounded-lg">
                                        <Image src={product.image?.url || ''} alt={product.image?.alt || ''} width={500} height={500} className='rounded-lg' />
                                    </div>
                                </CarouselItem>
                                {product.slider?.map((item) => (
                                    <CarouselItem key={item.id}>
                                        <div className="border rounded-lg">
                                            <Image src={item.image.url || ''} alt={item.image.alt} width={500} height={500} className='rounded-lg' />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            {/* <CarouselPrevious />
                            <CarouselNext /> */}
                        </Carousel>
                        <div className='mt-4 w-[500px] grid grid-cols-5 gap-3'>
                            <button className={cn("border rounded-lg bg-slate-100 flex items-center justify-center", { 'border-slate-900': current === 1 })}>
                                <Image src={product.image?.url || ''} alt={product.image?.alt || ''} width={500} height={500} className='rounded-lg mix-blend-multiply' />
                            </button>
                            {product.slider?.map((item, index) => (
                                <button className={cn("border rounded-lg bg-slate-100 flex items-center justify-center", { 'border-slate-900': current === index+2 })} key={`${item.id}-prev`} onClick={() => setCurrent(2)}>
                                    <Image src={item.image.url || ''} alt={item.image.alt} width={500} height={500} className='rounded-lg mix-blend-multiply object-cover' />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className='flex-grow'>
                        <h1 className='font-semibold text-3xl text-balance'>{product.title}</h1>
                        <div className='flex items-center gap-3 mt-2'>
                            <StarsComponent value={3.6} />
                            <p className='text-xs font-semibold'>(0 opinii)</p>
                        </div>
                        <div className='flex items-center w-full text-sm mt-1'>
                            <p>od: <Link href="#" className='font-semibold'>HP</Link></p>
                            <Separator orientation='vertical' className='mx-3 h-[20px] min-w-[1px]' />
                            <p>kod producenta: <span className='font-semibold'>{product.specification?.find((item) => item.type === 'manufacturerCode')?.value || ''}</span></p>
                            <Separator orientation='vertical' className='mx-3 h-[20px] min-w-[1px]' />
                            <p>kod NetNook: <span className='font-semibold'>{product.id}</span></p>
                        </div>

                        <div className='mt-4 grid grid-cols-2 gap-3'>
                            <div>
                                <div className='flex flex-col border-t pt-2'>
                                    {product.specification?.slice(0, 6).map((item) => (
                                        <div key={item.id} className='flex py-1'>
                                            <p className='text-sm font-semibold'><span className='text-gray-600 font-normal'>{specitifactionTypes[item.type]}:</span> {item.value.split(" (")[0]}</p>
                                        </div>
                                    ))}
                                    <button className='w-max py-1 px-2 text-sm font-normal border rounded-lg mt-2 flex items-center gap-1'>Przewiń do specyfikacji <Icons.Down className='w-4 h-4' /></button>
                                </div>
                            </div>
                            <div className='border rounded-lg backdrop-blur-md'>
                                <div className='p-5 border-b'>
                                    <h1 className='text-right text-3xl font-semibold'>{getPriceFromJSON(product.priceJSON)}</h1>
                                    <div className='flex items-center gap-2 mt-3'>
                                        <NumberInput className="max-w-[120px] min-w-0" min={1} max={9} defaultValue={1} onChange={(e) => setCurrentQuantity(parseInt(e.target.value))} />
                                        <Button className='w-full' onClick={handleAddToCart} disabled={added}>{added ? <Icons.Check className='h-4 w-4 mr-2' /> : <Icons.AddToCart className='h-4 w-4 mr-2' />} Dodaj do koszyka</Button>
                                    </div>
                                </div>
                                <div className='divide-y-[1px]'>
                                    <div className='flex items-center gap-1 p-3 px-4'>
                                        <Icons.CircleCheck className='h-5 w-5 text-slate-700' />
                                        <div className='text-md leading-5 ml-3'>
                                            <h1>Dostępny</h1>
                                            <h2 className='text-sm'>Dowiedz się więcej</h2>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-1 p-3 px-4'>
                                        <Icons.Clock className='h-5 w-5 text-slate-700' />
                                        <div className='text-md leading-5 ml-3'>
                                            <h1>Kup teraz, otrzymasz pojutrze</h1>
                                            <h2 className='text-sm'>Zapłać w ciągu <span className='text-slate-900 font-semibold'>4 godzin i 20 minut</span></h2>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-1 p-3 px-4'>
                                        <Icons.Truck className='h-5 w-5 text-slate-700' />
                                        <div className='text-md leading-5 ml-3'>
                                            <h1>Darmowa dostawa</h1>
                                            <h2 className='text-sm'>Dowiedz się więcej</h2>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-1 p-3 px-4'>
                                        <Icons.Wallet className='h-5 w-5 text-slate-700' />
                                        <div className='text-md leading-5 ml-3'>
                                            <h1>Dostępne płatności</h1>
                                            <h2 className='text-sm'>Karty płatnicze, BLIK, Przelewy24</h2>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

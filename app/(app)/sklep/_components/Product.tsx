import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/payload-types'
import { getPriceFromJSON } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { CartItem } from '@/hooks/Cart/reducer'
import { toast } from 'sonner'

interface ProductComponentProps { 
    product: Product, 
    layoutType: 'grid' | 'list', 
    addItemToCart?: (item: CartItem) => void, 
}

export default function ProductComponent({ product, layoutType, addItemToCart }: ProductComponentProps) {
    const [added, setAdded] = React.useState(false)

    const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.stopPropagation()
        e.preventDefault()
        if (addItemToCart) {
            addItemToCart({
                product: product,
                quantity: 1,
            })
            toast.success('Dodano produkt do koszyka')
        }
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    if (layoutType === 'grid') return (
        <Link href={`/p/${product.slug}-${product.id}`} className='flex flex-col items-center border border-slate-200 w-full backdrop-blur-sm rounded-lg p-2 transition-all cursor-pointer hover:border-slate-500' key={product.id}>
            <Image src={product.image?.thumbnailURL || ""} alt={product.image?.alt || ""} width={200} height={200} className='w-[200px] aspect-square object-contain rounded-lg' />
            <div className='py-2 px-4 flex flex-col w-full'>
                <div className='leading-none flex flex-col gap-1 flex-grow'>
                    <p className='text-slate-600'>{product.producer.title}</p>
                    <h1 className='text-[20px] font-semibold line-clamp-2'>{product.title}</h1>
                    <h2 className='text-black/70 leading-5 mt-2 line-clamp-3'>{product.description}</h2>

                    <div className='flex flex-wrap mt-3 gap-3'>
                        {product.categories?.map((tag: any) => (
                            <span key={tag.id} className='bg-slate-100 text-slate-800 px-2 py-1 rounded-md text-sm font-semibold'>{tag.title}</span>
                        ))}
                    </div>
                </div>
                <div className='min-w-max mt-3 flex items-center justify-between'>
                    <h1 className='font-medium text-xl'>{getPriceFromJSON(product.priceJSON)}</h1>
                    <Button variant={"outline"} size={"icon"} onClick={(e) => handleAddToCart(e)} disabled={added}>
                        {added ? <Icons.Check className='h-5 w-5' /> : <Icons.AddToCart className='h-5 w-5' />}
                    </Button>
                </div>
            </div>
        </Link>
    )

    return (
        <Link href={`/p/${product.slug}-${product.id}`} className='flex border border-slate-200 w-full backdrop-blur-sm first:rounded-t-lg last:rounded-b-lg p-4 transition-all cursor-pointer hover:border-slate-500' key={product.id}>
            <Image src={product.image?.thumbnailURL || ""} alt={product.image?.alt || ""} width={200} height={200} className='w-[200px] aspect-square object-contain rounded-lg' />
            <div className='p-4 flex w-full'>
                <div className='ml-2 leading-none flex-grow'>
                    <p className='text-slate-600'>{product.producer.title}</p>
                    <h1 className='text-2xl font-semibold'>{product.title}</h1>
                    <h2 className='text-black/70 leading-5 mt-2 line-clamp-3'>{product.description}</h2>

                    <div className='flex flex-wrap mt-3 gap-3'>
                        {product.categories?.map((tag: any) => (
                            <span key={tag.id} className='bg-slate-100 text-slate-800 px-2 py-1 rounded-md text-sm font-semibold'>{tag.title}</span>
                        ))}
                    </div>
                </div>
                <div className='min-w-max ml-2'>
                    <h1 className='font-semibold text-2xl'>699.99 zł</h1>
                </div>
            </div>
        </Link>  
    )
}

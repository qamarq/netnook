"use client"

import { useCart } from '@/hooks/Cart'
import { Product } from '@/payload-types'
import React from 'react'
import ProductComponent from '../sklep/_components/Product'

export default function ListOfProducts({ products }: { products: Product[] }) {
    const { addItemToCart } = useCart()
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product: any) => (
                // <div key={product.id} className="border transition-all border-slate-200 rounded-lg p-5 backdrop-blur-sm cursor-pointer hover:border-slate-500">
                //     <Image loading="eager" src={product.image.thumbnailURL} alt={product.title} width={400} height={300} className="rounded-lg" />
                //     <h1 className="text-lg font-semibold mt-3 line-clamp-1">{product.title}</h1>
                //     <p className="text-slate-600 mt-2 line-clamp-2">{product.description}</p>
                //     <div className="flex items-center justify-between mt-3">
                //         <h1 className="text-lg font-semibold">{getPriceFromJSON(product.priceJSON)}</h1>
                //         <Button variant={"outline"}>Dodaj do koszyka</Button>
                //     </div>
                // </div>
                <ProductComponent key={product.id} product={product} layoutType={"grid"} addItemToCart={addItemToCart} />  
            ))}
        </div>
    )
}

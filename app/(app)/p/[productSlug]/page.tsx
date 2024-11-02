import React from 'react'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { Product } from '@/payload-types'
import ProductPageComponent from './_components/ProductPageComponent'

export default async function ProductPage({ params }: { params: { productSlug: string } }) {
    try {
        const payload = await getPayloadHMR({ config })
        const productId = params.productSlug.split('-').pop()

        const product = await payload.findByID({
            collection: 'products',
            id: productId || '',
        })

        if (!product) {
            return notFound()
        }
        
        return (
            <ProductPageComponent product={product as any} />
        )
    } catch (error) {
        console.error(error)
        return notFound()
    }
}

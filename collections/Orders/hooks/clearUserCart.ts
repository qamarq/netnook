

import type { Order } from '../../../payload-types'

import { CollectionAfterChangeHook } from 'payload/types';

export const clearUserCart: CollectionAfterChangeHook<Order> = async ({ doc, req, operation }) => {
    const { payload } = req

    if (operation === 'create' && doc.orderedBy) {
        const orderedBy = typeof doc.orderedBy === 'object' ? doc.orderedBy.id : doc.orderedBy

        const user = await payload.findByID({
            collection: 'users',
            id: orderedBy,
        })

        if (user) {
            await payload.update({
                collection: 'users',
                id: orderedBy,
                data: {
                    cart: {
                        items: [],
                    },
                },
            })

            
            // TODO: IMPORTANT: Uncomment this block of code if you have a collection of products and you want to update the stock and countOfOrders of each product in the order
            // if (doc.items && doc.items.length > 0 && typeof doc.items[0].product !== 'string') {
            //     await Promise.all(doc.items.map(async (item: any) => {
            //         if (typeof item.product === 'object') {
            //             await payload.update({
            //                 collection: 'products',
            //                 id: item.product.id,
            //                 data: {
            //                     stock: item.product.stock - (item.quantity || 0),
            //                     countOfOrders: item.product.countOfOrders + (item.quantity || 0),
            //                     skipSync: true
            //                 },
            //             })
            //         }
            //     }))
            // }
        }
    }

    return
}

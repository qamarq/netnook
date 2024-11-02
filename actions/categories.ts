"use server"

import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'

export const getAllCategoriesQuery = async () => {
    const payload = await getPayloadHMR({ config })

    const categories = await payload.find({
        collection: 'categories',
        limit: 30,
        where: { parent: { exists: false } }
    })

    return categories.docs
}

export const getAllProducersQuery = async () => {
    const payload = await getPayloadHMR({ config })

    const producers = await payload.find({
        collection: 'producers',
        limit: 30,
        where: { parent: { exists: false } }
    })

    return producers.docs
}
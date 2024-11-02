"use server"

import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import { vectorize } from '@/lib/semantic'
import { prisma } from '@/lib/db'

export const getProductsQuery = async (options: { sort: string, query?: string, categories: string[], producers: string[] }) => {
    console.log("EXECTUING QUERY")
    const start = Date.now();
    const payload = await getPayloadHMR({ config })

    const sortName = options.sort.split("_")[0] // best (no sorting), price, title, date
    const sortType = options.sort.split("_")[1] // asc, desc

    let sortNameDB = sortName
    if (sortName === "best") sortNameDB = "id"
    if (sortName === "date") sortNameDB = "createdAt"
    if (sortName === "price") sortNameDB = "priceJSON.data[0].unit_amount"

    let products = undefined

    if (options.query) {
        const query = await vectorize(options.query)

        const result: any = await prisma.products.aggregateRaw({
            pipeline: [
                {
                    "$vectorSearch": {
                        "index": "vector_index",
                        "path": "productEmbeddings",
                        "queryVector": query,
                        "numCandidates": 200,
                        "limit": 20
                    }
                },
                {
                    '$project': {
                        '_id': 1,
                        'score': {
                            '$meta': 'vectorSearchScore'
                        }
                    }
                },
                {
                    "$sort": {
                        "score": -1
                    }
                },
                {
                    "$match": {
                        "$expr": {
                            "$gt": [ "$score", 0.7 ]
                        }
                    }
                }
            ]
        });

        products = await payload.find({
            collection: 'products',
            limit: 100,
            sort: `${(sortType === "desc" || !sortType) ? "-" : ""}${sortNameDB}`,
            where: {
                _id: {
                    in: result.map((product: any) => product._id.$oid)
                },
                categories: {
                    [options.categories.length === 0 ? "not_in" : "in"]: options.categories
                },
                producer: {
                    [options.producers.length === 0 ? "not_in" : "in"]: options.producers
                },
            }
        })
    } else {
        products = await payload.find({
            collection: 'products',
            limit: 100,
            sort: `${(sortType === "desc" || !sortType) ? "-" : ""}${sortNameDB}`,
            where: {
                categories: {
                    [options.categories.length === 0 ? "not_in" : "in"]: options.categories
                },
                producer: {
                    [options.producers.length === 0 ? "not_in" : "in"]: options.producers
                },
            }
        })
    }

    const end = Date.now();
    console.log(`Execution time: ${end - start} ms`);

    return products
}
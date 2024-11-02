"use server"

import { prisma } from "@/lib/db";
import { vectorize } from "@/lib/semantic"
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'

export const semanticSearch = async (input: string) => {
    const query = await vectorize(input)

    const result: any = await prisma.products.aggregateRaw({
        pipeline: [
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "productEmbeddings",
                    "queryVector": query,
                    "numCandidates": 200,
                    "limit": 5
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

    // const result = [
    //     {
    //         _id: { '$oid': '66212d98e97475b44ff8e589' },
    //         score: 0.9352704286575317
    //     },
    //     {
    //         _id: { '$oid': '661ec3a7a8000b99c285c910' },
    //         score: 0.9326357841491699
    //     },
    //     {
    //         _id: { '$oid': '66212e10e97475b44ff8e6cf' },
    //         score: 0.9326357841491699
    //     },
    //     {
    //         _id: { '$oid': '66212e54e97475b44ff8e768' },
    //         score: 0.9326357841491699
    //     }
    // ]

    // console.log(result[0]._id.$oid)

    const payload = await getPayloadHMR({ config })

    // console.log(result)

    const allProductsWithIdsFromResult = await payload.find({
        collection: 'products',
        where: {
            _id: {
                in: result.map((product: any) => product._id.$oid)
            }
        }
    })

    return allProductsWithIdsFromResult

    // const preparedResult = await Promise.all(result.map(async (product: any) => {

    //     if (product.score < 0.9) return undefined

    //     const productFromPayload = await payload.find({
    //         collection: 'products',
    //         where: {
    //             _id: product._id
    //         }
    //     })

    //     return productFromPayload.docs[0]
    // }))

    // // Remove undefined values from the array
    // return preparedResult.filter((product: any) => product !== undefined)
}
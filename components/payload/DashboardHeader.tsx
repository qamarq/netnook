import React from 'react'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'

export default async function DashboardHeader() {
    const payload = await getPayloadHMR({ config })

    const productsCount = (await payload.find({ collection: 'products' })).docs.length
    const usersCount = (await payload.find({ collection: 'users' })).docs.length
    const ordersCount = (await payload.find({ collection: 'orders' })).docs.length

    return (
        <div className='flex flex-col'>
            <h2 className='text-5xl font-semibold'>Witaj w panelu zarządzania treściami strony NetNook!</h2>
            <p className='text-lg mt-3'>Możesz tutaj zmienić cennik produktów lub dodać nowe projekty realizowane przez firmę. Dane skasowane nie są do odzyskania!</p>
            <ul className='list-inside list-disc'>
                <li>Liczba produktów: <span className='font-semibold'>{productsCount}</span></li>
                <li>Liczba użytkowników: <span className='font-semibold'>{usersCount}</span></li>
                <li>Liczba zamówień: <span className='font-semibold'>{ordersCount}</span></li>
            </ul>
        </div>
    )
}
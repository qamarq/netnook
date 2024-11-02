import { Icons } from '@/components/icons'
import Link from 'next/link'
import React from 'react'

export default function Footer() {
    return (
        <div className='w-full border-t'>
            <div className='max-w-7xl mx-auto grid grid-cols-3 py-6'>
                <div className='flex items-center gap-2'>
                    <Icons.Logo size={24} />
                    <h1 className='font-semibold text-lg tracking-tight'>NetNook</h1>
                </div>
                <p className='text-center'>Made with ❤️ by <Link href="https://kamilmarczak.pl">Kamil Marczak</Link></p>
                <div className='flex items-center gap-2 justify-end'>
                    <Link href="#" className='underline'>Polityka prywatności</Link>
                    <Link href="#" className='underline'>Regulamin</Link>
                </div>
            </div>
        </div>
    )
}

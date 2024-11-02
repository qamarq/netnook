"use client"

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/Auth'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useRef } from 'react'
import { set } from 'zod'

export default function VerifyEmailPage() {
    const searchParams = useSearchParams()
    const token = useRef(searchParams.get('token'))
    const [done, setDone] = React.useState(false)
    const firstTimeRef = useRef(true)

    const { verifyEmail } = useAuth()
    
    const [statuses, setStatuses] = React.useState<{type: string, label: string}[]>([
        {type: "loader", label: "Inicjalizacja"}
    ])

    const verifyEmailHandle = async () => {
        setStatuses(prev => [...prev, {type: "loader", label: "Wysyłanie zapytania do serwera"}])

        if (!token.current) {
            setStatuses(prev => [...prev, {type: "error", label: "Nie znaleziono tokenu"}])
            setDone(true)
            return
        }

        try {
            await verifyEmail({ token: token.current })
            setStatuses(prev => [...prev, {type: "success", label: "Zweryfikowano adres email"}])
            setDone(true)
        } catch (err) {
            setStatuses(prev => [...prev, {type: "error", label: "Błąd weryfikacji adresu email"}])
            setDone(true)
        }
    }

    useEffect(() => {
        if (firstTimeRef.current) {
            firstTimeRef.current = false
            verifyEmailHandle()
        }
    }, [])
    
    return (
        <div className='pt-20 flex items-center justify-center'>
            <div className='bg-slate-100/40 p-4 py-10 backdrop-blur-sm rounded-lg w-full max-w-[550px] border'>
                <h1 className='text-xl font-semibold text-center mb-10'>Weryfikacja Twojego adresu email...</h1>

                <div className='flex flex-col gap-2 w-full max-w-[350px] mx-auto'>
                    {statuses.map((status, i) => (
                        <code key={status.label} className='flex items-center'>
                            {(i === statuses.length-1 && !done) ? <Icons.Loader className='w-4 h-4 mr-2 animate-spin text-blue-500' /> : (status.type === 'error' ? <Icons.X className='w-4 h-4 mr-2 text-rose-500' /> : <Icons.Check className='w-4 h-4 mr-2 text-emerald-500' />) } 
                            {status.label}...
                        </code>
                    ))}
                </div>

                <div className='mt-4 flex flex-col gap-2 w-full max-w-[350px] mx-auto'>
                    <Link href="/login" aria-disabled={!done} className={cn('w-full', !done && 'pointer-events-none')}>
                        <Button disabled={!done} className='w-full'>Wróć na stronę logowania</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

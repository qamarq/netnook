"use client"

import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

export default function SearchBox() {
    const searchParams = useSearchParams()
    const defaultQuery = searchParams.get('query') || ''
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [query, setQuery] = React.useState(defaultQuery)
    const router = useRouter()
    const [isSearching, startTransition] = React.useTransition()

    const search = async () => {
        startTransition(() => {
            router.push(`/sklep/searching?query=${query}`)
        })
    }

    return (
        <div className='relative max-w-5xl mx-auto h-14 rounded-md'>
            <Input 
                disabled={isSearching}
                ref={inputRef}
                className='absolute inset-0 h-full' 
                placeholder='Wyszukaj produkt' 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Escape") {
                        inputRef.current?.blur()
                    }

                    if (e.key === "Enter") {
                        search()
                    }
                }}
            />
            <Button 
                disabled={isSearching}
                onClick={search} 
                className='absolute right-0 inset-y-0 h-full rounded-l-none' 
                size={"sm"}
            >
                {isSearching ? <Icons.Loader className='w-6 h-6 animate-spin' /> : <Icons.Search className='w-6 h-6' />}
            </Button>
        </div>
    )
}

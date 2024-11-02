import React, { Suspense } from 'react'

export default function PodsumowanieLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense>
            {children}
        </Suspense>
    )
}

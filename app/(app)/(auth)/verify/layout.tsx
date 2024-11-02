import React, { Suspense } from 'react'

export default function VerifyLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense>{children}</Suspense>
    )
}

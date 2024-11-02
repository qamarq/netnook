import React, { Suspense } from 'react'
export default function SklepPageLayout({ children }: { children: React.ReactNode }) {
    return <Suspense>{children}</Suspense>
}

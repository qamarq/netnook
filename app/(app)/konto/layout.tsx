import React from 'react'
import NavbarNavigation from './_components/NavbarNavigation'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
    const payload = await getPayloadHMR({ config })
    
    const myHeaders = headers()
    const { user } = await payload.auth({ headers: myHeaders })

    if (!user) { return redirect('/login') }

    const notifications = await payload.find({
        collection: 'notifications',
        where: { and: [{ user: { equals: user.id } }, { read: { equals: false } }] }
    })
    
    return (
        <div className="flex min-h-screen flex-col space-y-6 py-20">
            <div className="max-w-7xl mx-auto w-full grid flex-1 gap-[12px] md:grid-cols-[200px_1fr] backdrop-blur-sm rounded-xl border">
                <aside className="hidden w-full max-w-[300px] flex-col md:flex border-r py-5">
                    <NavbarNavigation count={notifications.totalDocs} />
                </aside>
                <main className="flex w-full flex-1 flex-col overflow-auto p-5">
                    {children}
                </main>
            </div>
            {/* <SiteFooter className="border-t" /> */}
        </div>
    )
}

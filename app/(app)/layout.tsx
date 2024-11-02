import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./_components/Header";
import { headers } from "next/headers";
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import { Providers } from "./providers";
import { Toaster } from "sonner"
import Footer from "./_components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "NetNook",
    description: "Generated by create next app",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const payload = await getPayloadHMR({ config })

    const categories = await payload.find({
        collection: 'categories',
        limit: 15,
        where: {
            parent: {
                exists: false
            }
        }
    })

    return (
        <html lang="pl">
            <Providers>
                <body className={inter.className}>
                    <main className="relative min-h-screen isolate border-b border-gray-200 bg-white">
                        <svg
                            className='absolute inset-0 -z-10 h-full w-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]'
                            aria-hidden='true'>
                            <defs>
                                <pattern
                                id='0787a7c5-978c-4f66-83c7-11c213f99cb7'
                                width={200}
                                height={200}
                                x='50%'
                                y={-1}
                                patternUnits='userSpaceOnUse'>
                                <path d='M.5 200V.5H200' fill='none' />
                                </pattern>
                            </defs>
                            <rect
                                width='100%'
                                height='100%'
                                strokeWidth={0}
                                fill='url(#0787a7c5-978c-4f66-83c7-11c213f99cb7)'
                            />
                        </svg>

                        <Header categories={categories.docs as any} />
                        <div className="min-h-screen">
                            {children}
                        </div>
                        <Footer />
                    </main>
                    <Toaster />
                </body>
            </Providers>
        </html>
    );
}

import { Icons } from "@/components/icons";
import Image from "next/image";
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'

import LaptopImage from "@/public/assets/laptop.webp"
import { Button } from "@/components/ui/button";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

import GoogleImage from "@/public/assets/companies/google.png"
import ShadcnImage from "@/public/assets/companies/shadcn.png"
import NextJSImage from "@/public/assets/companies/nextjs.png"
import PayloadCMSImage from "@/public/assets/companies/payload.png"
import StripeImage from "@/public/assets/companies/stripe.png"
import VercelImage from "@/public/assets/companies/vercel.png"
import MongoDBImage from "@/public/assets/companies/mongodb.png"
import PrismaImage from "@/public/assets/companies/prisma.png"
import OpenAIImage from "@/public/assets/companies/openai.png"
import { Product } from "@/payload-types";
import { getPriceFromJSON } from "@/lib/utils";
import ProductComponent from "./sklep/_components/Product";
import ListOfProducts from "./_components/ListOfProducts";

import BoxesImage from "@/public/assets/home_carts/boxes.png"
import PhonesImage from "@/public/assets/home_carts/phones.png"
import HeadphonesImage from "@/public/assets/home_carts/headphones.png"
import Link from "next/link";

const testimonials = [
    { image: GoogleImage, alt: "Google logo" },
    { image: ShadcnImage, alt: "Shadcn logo" },
    { image: NextJSImage, alt: "Next.js logo" },
    { image: PayloadCMSImage, alt: "Payload CMS logo" },
    { image: StripeImage, alt: "Stripe logo" },
    { image: VercelImage, alt: "Vercel logo" },
    { image: MongoDBImage, alt: "MongoDB logo" },
    { image: PrismaImage, alt: "Prisma logo" },
    { image: OpenAIImage, alt: "OpenAI logo" },
];

export default async function Home() {
    const payload = await getPayloadHMR({ config })

    const products = await payload.find({
        collection: 'products',
        limit: 4,
    })

    // console.log(products.docs)

    return (
        <>
            <main className="pt-24 max-w-7xl mx-auto px-4 md:px-0">
                <section className="border border-slate-200 bg-slate-200/20 p-4 md:p-10 backdrop-blur-sm rounded-lg grid grid-cols-1 md:grid-cols-2">
                    <div className="flex flex-col p-4 md:p-16">
                        <h1 className="text-5xl font-medium tracking-tight">Witaj w <span className="font-bold">NetNook</span> 🎉</h1>
                        <p className="text-slate-600 mt-5">Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestias nisi, ipsam modi earum ducimus quos omnis ipsum eos porro! Asperiores quia cum molestiae. Aut rem nulla reiciendis totam a saepe!</p>
                        <div className="flex items-center gap-2 mt-5">
                            <Link href="/sklep"><Button>Przejdź do sklepu</Button></Link>
                            <Link href="/kontakt"><Button variant={"outline"}>Kontakt</Button></Link>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <Image src={LaptopImage} alt="Laptop image" />
                    </div>
                </section>

                <section className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="border rounded-lg p-3 py-4 flex items-center gap-2 backdrop-blur-sm cursor-default transition-colors bg-transparent hover:bg-slate-100">
                        <Icons.Headset className="h-[28px] w-[28px] min-w-[28px]" />
                        <div className="ml-2">
                            <h1 className="text-sm font-semibold">Wsparcie 24/7</h1>
                            <p className="text-xs text-slate-600">Lorem ipsum dolor sit amet consectetur.</p>
                        </div>
                    </div>
                    <div className="border rounded-lg p-3 py-4 flex items-center gap-2 backdrop-blur-sm cursor-default transition-colors bg-transparent hover:bg-slate-100">
                        <Icons.Shield className="h-[28px] w-[28px] min-w-[28px]" />
                        <div className="ml-2">
                            <h1 className="text-sm font-semibold">Bezpieczeństwo Twoich danych</h1>
                            <p className="text-xs text-slate-600">Lorem ipsum dolor sit amet consectetur.</p>
                        </div>
                    </div>
                    <div className="border rounded-lg p-3 py-4 flex items-center gap-2 backdrop-blur-sm cursor-default transition-colors bg-transparent hover:bg-slate-100">
                        <Icons.Truck className="h-[28px] w-[28px] min-w-[28px]" />
                        <div className="ml-2">
                            <h1 className="text-sm font-semibold">Szybka dostawa zamówień</h1>
                            <p className="text-xs text-slate-600">Lorem ipsum dolor sit amet consectetur.</p>
                        </div>
                    </div>
                    <div className="border rounded-lg p-3 py-4 flex items-center gap-2 backdrop-blur-sm cursor-default transition-colors bg-transparent hover:bg-slate-100">
                        <Icons.PackageOpen className="h-[28px] w-[28px] min-w-[28px]" />
                        <div className="ml-2">
                            <h1 className="text-sm font-semibold">Gwarantowany zwrot do 14 dni</h1>
                            <p className="text-xs text-slate-600">Lorem ipsum dolor sit amet consectetur.</p>
                        </div>
                    </div>
                </section>
                <section>
                    <div className="h-[20rem] rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
                        <InfiniteMovingCards
                            items={testimonials}
                            direction="right"
                            speed="slow"
                            pauseOnHover={false}
                        />
                    </div>
                </section>
                <section className="pb-16">
                    <h1 className="text-2xl tracking-tight font-semibold mb-6">Polecane produkty</h1>
                    <ListOfProducts products={products.docs as any} />
                </section>
                <section className="pb-10">
                    <h1 className="text-2xl tracking-tight font-semibold mb-6">Nasza oferta</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-slate-200/20 backdrop-blur-sm rounded-lg p-10 relative col-span-2 row-span-2 overflow-hidden">
                            <h1 className="text-2xl font-semibold">Darmowa dostawa</h1>
                            <p className="max-w-[500px] text-muted-foreground mt-2 mb-5">Jeśli wydasz minimum 99zł, możesz zamówić za darmo do paczkomatu a od 199zł, otrzymasz darmową dostawę kurierem.</p>
                            <Button>Przejdź do sklepu</Button>

                            <Image src={BoxesImage} alt="Boxes" draggable={false} className="absolute bottom-[-200px] right-[-100px] w-[700px] z-[-1]" />
                            <Image src={BoxesImage} alt="Boxes" draggable={false} className="absolute bottom-[-300px] left-[-250px] w-[700px] scale-x-[-1] z-[-1]" />
                        </div>
                        <div className="bg-slate-200/20 backdrop-blur-sm rounded-lg p-10 relative min-h-auto md:min-h-[250px] overflow-hidden">
                            <h1 className="text-2xl font-semibold">Przeceny na Black Friday</h1>
                            <p className="max-w-[300px] text-muted-foreground mt-2 mb-5">Przeceny obowiązują na wszystkie kategorie i są do nawet 80%</p>
                            <Button>Przejdź do sklepu</Button>

                            <Image src={PhonesImage} alt={''} draggable={false} className="absolute bottom-[-100px] right-[-50px] w-[300px] z-[-1]" />
                        </div>
                        <div className="bg-slate-200/20 backdrop-blur-sm rounded-lg p-10 relative min-h-auto md:min-h-[250px] overflow-hidden">
                            <h1 className="text-2xl font-semibold text-balance">20% przeceny na pierwszy zakup</h1>
                            <p className="max-w-[300px] text-muted-foreground mt-2 mb-5">Użyj kodu FIRSTDAY<br/> aby skorzystać</p>
                            <Button>Przejdź do sklepu</Button>

                            <Image src={HeadphonesImage} alt={''} draggable={false} className="absolute bottom-[-40px] right-[-30px] w-[200px] z-[-1]" />
                        </div>
                    </div>
                </section>
            </main>  
        </>
    );
}

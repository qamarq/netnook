"use client"

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React from 'react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from '@/lib/utils';
import SearchBox from './_components/SearchBox';
import { Category, Producer, Product } from '@/payload-types';
import { getProductsQuery } from '@/actions/products';
import ProductComponent from './_components/Product';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { getAllCategoriesQuery, getAllProducersQuery } from '@/actions/categories';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/Cart';

const sortingOptions = ["best", "price_asc", "price_desc", "title_asc", "title_desc", "date_asc", "date_desc"] as const

export default function SklepPage() {
    const searchParams = useSearchParams()
    
    // Default layout is list
    const currentLayout = searchParams.get("layout") === 'list' ? 'list' : 'grid';
    const currentSort = searchParams.get("sort") || 'best';
    const defaultQuery = searchParams.get("query") || ''
    const defaultCategories = searchParams.getAll("category")
    const defaultProducers = searchParams.getAll("producer")

    // React states
    const [isLoadingProducts, startLoadingProductsTransition] = React.useTransition()
    const [isLoadingAddons, startLoadingAddonsTransition] = React.useTransition()
    const [isSearching, startSearchingTransition] = React.useTransition()

    const [selectedLayout, setSelectedLayout] = React.useState<'list' | 'grid'>(currentLayout)
    const [selectedSorting, setSelectedSorting] = React.useState<typeof sortingOptions[number]>(currentSort as typeof sortingOptions[number])
    const [selectedCategories, setSelectedCategories] = React.useState<string[]>(defaultCategories)
    const [selectedProducers, setSelectedProducers] = React.useState<string[]>(defaultProducers)
    const [query, setQuery] = React.useState(defaultQuery)

    const [products, setProducts] = React.useState<Product[]>([])
    const [categories, setCategories] = React.useState<Category[]>([])
    const [producers, setProducers] = React.useState<Producer[]>([])

    // React refs
    const firstTimeRef = React.useRef(true)
    const inputRef = React.useRef<HTMLInputElement>(null)

    // Next.js hooks
    const pathname = usePathname();
    const { replace } = useRouter();

    const { addItemToCart } = useCart()


    // Fetching functions
    const getProducts = ({ options }: { options: { sort: string, query?: string, categories: string[], producers: string[] } }) => {
        startLoadingProductsTransition(async () => {
            const response = await getProductsQuery(options)
            setProducts(response.docs as unknown as Product[])
        })
    }

    const getCategories = () => {
        startLoadingAddonsTransition(async () => {
            const response = await getAllCategoriesQuery()
            setCategories(response as unknown as Category[])
        })
    }

    const getProducers = () => {
        startLoadingAddonsTransition(async () => {
            const response = await getAllProducersQuery()
            setProducers(response as unknown as Producer[])
        })
    }

    // Event handlers
    const handleChangeLayout = (layout: 'list' | 'grid') => {
        const params = new URLSearchParams(searchParams);

        if (layout === "grid") {
            params.delete('layout')
        } else {
            params.set('layout', layout)
        }

        replace(`${pathname}?${params.toString()}`);
        setSelectedLayout(layout)
    }

    const handleChangeSorting = (sorting: string) => {
        const params = new URLSearchParams(searchParams);

        if (sorting === "best") {
            params.delete('sort')
        } else {
            params.set('sort', sorting)
        }

        replace(`${pathname}?${params.toString()}`);
        setSelectedSorting(sorting as typeof sortingOptions[number])
        getProducts({ options: { sort: sorting, categories: selectedCategories, query, producers: selectedProducers } })
    }

    const handleChangeCategories = (categoryId: string, checked: boolean) => {
        const params = new URLSearchParams(searchParams);

        if (checked) {
            params.append('category', categoryId)
        } else {
            params.delete('category', categoryId)
        }

        replace(`${pathname}?${params.toString()}`);

        let preparedCategories = []
        if (checked) {
            preparedCategories = [...selectedCategories, categoryId]
        } else {
            preparedCategories = [...selectedCategories.filter((category) => category !== categoryId)]
        }

        setSelectedCategories(preparedCategories)
        getProducts({ options: { sort: selectedSorting, categories: preparedCategories, query, producers: selectedProducers } })
    }

    const handleChangeProducer = (producerId: string, checked: boolean) => {
        const params = new URLSearchParams(searchParams);

        if (checked) {
            params.append('producer', producerId)
        } else {
            params.delete('producer', producerId)
        }

        replace(`${pathname}?${params.toString()}`);

        let preparedProducers = []
        if (checked) {
            preparedProducers = [...selectedProducers, producerId]
        } else {
            preparedProducers = [...selectedProducers.filter((producer) => producer !== producerId)]
        }

        setSelectedProducers(preparedProducers)
        getProducts({ options: { sort: selectedSorting, categories: selectedCategories, query, producers: preparedProducers } })
    }

    const handleSearch = async () => {
        const params = new URLSearchParams(searchParams);

        if (query) {
            params.set('query', query)
        } else {
            params.delete('query')
        }

        replace(`${pathname}?${params.toString()}`);

        startSearchingTransition(async () => {
            getProducts({ options: { sort: selectedSorting, query, categories: selectedCategories, producers: selectedProducers } })
        })
    }

    // Effects
    React.useEffect(() => {
        if (firstTimeRef.current) {
            getProducts({ options: { sort: selectedSorting, query, categories: selectedCategories, producers: selectedProducers } })
            getCategories()
            getProducers()

            firstTimeRef.current = false
            return
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    
    return (
        <div className='pt-24 max-w-7xl mx-auto'>
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
                            handleSearch()
                        }
                    }}
                />
                <Button 
                    disabled={isSearching}
                    onClick={handleSearch} 
                    className='absolute right-0 inset-y-0 h-full rounded-l-none' 
                    size={"sm"}
                >
                    {isSearching ? <Icons.Loader className='w-6 h-6 animate-spin' /> : <Icons.Search className='w-6 h-6' />}
                </Button>
            </div>

            <div className='flex mt-10 gap-5'>
                <div className='min-w-[300px]'>
                    <div className='border border-slate-200 backdrop-blur-sm rounded-lg'>
                        <div className='px-4 py-3 border-b border-slate-200'>
                            <h1 className='font-semibold text-lg'>Filtruj według</h1>
                        </div>
                        <div className='px-4 py-3'>
                            <Accordion type="multiple" className="w-full" defaultValue={["item-1"]}>
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>Kategorie</AccordionTrigger>
                                    <AccordionContent>
                                        <div className='flex flex-col gap-3'>
                                            {categories.map((category: Category) => (
                                                <div className="flex items-center space-x-2" key={category.id}>
                                                    <Checkbox id={category.id} checked={selectedCategories.includes(category.id)} onCheckedChange={(checked) => handleChangeCategories(category.id, checked as boolean)} disabled={isLoadingAddons} />
                                                    <label
                                                        htmlFor={category.id}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                    {category.title}
                                                    </label>
                                                </div>  
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>Producenci</AccordionTrigger>
                                    <AccordionContent>
                                        <div className='flex flex-col gap-3'>
                                            {producers.map((producer: Producer) => (
                                                <div className="flex items-center space-x-2" key={producer.id}>
                                                    <Checkbox id={producer.id} checked={selectedProducers.includes(producer.id)} onCheckedChange={(checked) => handleChangeProducer(producer.id, checked as boolean)} disabled={isLoadingAddons} />
                                                    <label
                                                        htmlFor={producer.id}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                    {producer.title}
                                                    </label>
                                                </div>  
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>Cena</AccordionTrigger>
                                    <AccordionContent>
                                    Yes. It&apos;s animated by default, but you can disable it if you
                                    prefer.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </div>
                </div>
                <div className='grow flex flex-col'>
                    <div className='flex items-center w-full gap-2 mb-5'>
                        <Button variant={"ghost"} size={"icon"} onClick={() => handleChangeLayout('grid')}>
                            <Icons.Grid className={cn('w-6 h-6 transition-all opacity-100', selectedLayout !== 'grid' && 'text-slate-700 opacity-50')} />
                        </Button>
                        <Button variant={"ghost"} size={"icon"} onClick={() => handleChangeLayout('list')}>
                            <Icons.List className={cn('w-6 h-6 transition-all opacity-100', selectedLayout !== 'list' && 'text-slate-700 opacity-50')} />
                        </Button>

                        <p className='ml-10'>Znaleziono <span className='font-semibold'>{products.length}</span> {products.length === 1 ? 'produkt' : (products.length === 2 || products.length === 3 || products.length === 4) ? 'produkty' : 'produktów'}</p>

                        <div className='flex-grow' />
                        <div className='flex items-center gap-2'>
                            <p className='font-medium'>Sortuj wg: </p>
                            <Select onValueChange={handleChangeSorting} value={selectedSorting}>
                                <SelectTrigger className="w-[240px]">
                                    <SelectValue placeholder="Sortuj według" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Opcje sortowania</SelectLabel>
                                        <SelectItem value="best">Trafność</SelectItem>
                                        <SelectItem value="price_asc">Cena: od najtańszych</SelectItem>
                                        <SelectItem value='price_desc'>Cena: od najdroższych</SelectItem>
                                        <SelectItem value='title_asc'>Nazwa: A-Z</SelectItem>
                                        <SelectItem value='title_desc'>Nazwa: Z-A</SelectItem>
                                        <SelectItem value='date_asc'>Data: najstarsze</SelectItem>
                                        <SelectItem value='date_desc'>Data: najnowsze</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className={cn('pt-7 pb-10', selectedLayout === 'list' ? 'flex flex-col' : 'grid grid-cols-2 gap-3 lg:grid-cols-3')}>
                        {isLoadingProducts ? (
                            <div className='flex-grow flex items-center justify-center'>
                                <p>Ładowanie...</p>
                            </div>
                        ) : (
                            <>
                                {products.length === 0 ? (
                                    <div className='flex-grow flex items-center justify-center'>
                                        <p>Brak produktów</p>
                                    </div>
                                ) : (
                                    <>
                                        {products.map((product: Product) => (
                                            <ProductComponent key={product.id} product={product} layoutType={selectedLayout} addItemToCart={addItemToCart} />  
                                        ))}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

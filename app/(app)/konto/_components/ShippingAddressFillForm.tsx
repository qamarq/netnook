"use client"

import { updateAddressShipping } from '@/actions/users';
import { Icons } from '@/components/icons';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/Auth';
import { AddressElement } from '@stripe/react-stripe-js';
import { type StripeAddressElementChangeEvent } from '@stripe/stripe-js';
import React from 'react'
import { toast } from 'sonner';

export default function ShippingAddressFillForm() {
    const [isLoading, startTransition] = React.useTransition()
    const { user, refreshUser } = useAuth();
    const [addressData, setAddressData] = React.useState<StripeAddressElementChangeEvent | null>(null)

    const handleSave = () => {
        if (!addressData) return
        startTransition(async () => {
            await updateAddressShipping(addressData)
                .then(async data => {
                    if (data.success) {
                        await refreshUser()
                        toast.success('Adres został zapisany')
                    } else {
                        toast.error(data.error)
                    }
                })
        })
    }

    const handleSetTheSameAsMain = () => {
        if (!user) return
        
    }
    
    return (
        <AccordionItem value="item-2" className='border rounded-lg'>
            <AccordionTrigger className='px-6'>
                <h1 className='text-xl font-semibold tracking-tight'>Adres dostawy</h1>
            </AccordionTrigger>
            <AccordionContent>
                <div className='px-6 py-4'>
                    {user && (
                        <AddressElement onChange={setAddressData} options={{
                            mode: 'shipping',
                            allowedCountries: ['PL'],
                            fields: { phone: 'always' },
                            validation: { phone: { required: 'always' } },
                            display: { name: 'full' },
                            defaultValues: {
                                name: user?.groupAddressShipping?.name,
                                address: {
                                    line1: user?.groupAddressShipping?.streetLine1,
                                    line2: user?.groupAddressShipping?.streetLine2,
                                    city: user?.groupAddressShipping?.city,
                                    state: user?.groupAddressShipping?.state,
                                    postal_code: user?.groupAddressShipping?.zip,
                                    country: user?.groupAddressShipping?.country || 'PL',
                                },
                                phone: user?.groupAddressShipping?.phone,
                            },
                            autocomplete: {
                                mode: 'google_maps_api',
                                apiKey: process.env.NEXT_PUBLIC_GMAPS_API!,
                            }
                        }} />
                    )}
                    
                    <div className='w-full flex items-center justify-end mt-4 gap-3'>
                        <Button variant={"outline"} onClick={handleSetTheSameAsMain}>Ustaw ten sam adres jak główny</Button>
                        <Button disabled={!addressData?.complete || isLoading} onClick={handleSave}>{isLoading && <Icons.Loader className='w-4 h-4 mr-2 animate-spin' />}Zapisz adres dostawy</Button>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    )
}

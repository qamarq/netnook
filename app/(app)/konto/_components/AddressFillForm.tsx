"use client"

import { updateAddressBilling } from '@/actions/users';
import { Icons } from '@/components/icons';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/Auth';
import { AddressElement } from '@stripe/react-stripe-js';
import { type StripeAddressElementChangeEvent } from '@stripe/stripe-js';
import React from 'react'
import { toast } from 'sonner';

export default function AddressFillForm() {
    const [isLoading, startTransition] = React.useTransition()
    const { user, refreshUser } = useAuth();
    const [addressData, setAddressData] = React.useState<StripeAddressElementChangeEvent | null>(null)

    const handleSave = () => {
        if (!addressData) return
        startTransition(async () => {
            await updateAddressBilling(addressData)
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
    
    return (
        <AccordionItem value="item-1" className='border rounded-lg'>
            <AccordionTrigger className='px-6'>
                <h1 className='text-xl font-semibold tracking-tight'>Twój adres</h1>
            </AccordionTrigger>
            <AccordionContent>
                <div className='px-6 py-4'>
                    {user && (
                        <AddressElement onChange={setAddressData} options={{
                            mode: 'billing',
                            allowedCountries: ['PL'],
                            fields: { phone: 'always' },
                            validation: { phone: { required: 'always' } },
                            display: { name: 'full' },
                            defaultValues: {
                                name: user?.name,
                                address: {
                                    line1: user?.groupAddress?.streetLine1,
                                    line2: user?.groupAddress?.streetLine2,
                                    city: user?.groupAddress?.city,
                                    state: user?.groupAddress?.state,
                                    postal_code: user?.groupAddress?.zip,
                                    country: user?.groupAddress?.country || 'PL',
                                },
                                phone: user?.phone,
                            
                            },
                            autocomplete: {
                                mode: 'google_maps_api',
                                apiKey: process.env.NEXT_PUBLIC_GMAPS_API!,
                            }
                        }} />
                    )}
                    
                    <div className='w-full flex items-center justify-end mt-4'>
                        <Button disabled={!addressData?.complete || isLoading} onClick={handleSave}>{isLoading && <Icons.Loader className='w-4 h-4 mr-2 animate-spin' />}Zapisz swój adres</Button>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    )
}

import React, { Suspense } from 'react'
import { RegisterForm } from '../login/_components/RegisterForm'

export default function RegisterPage() {
    return (
        <div className='pt-20 container mx-auto'>
            <Suspense><RegisterForm /></Suspense>
        </div>
    )
}

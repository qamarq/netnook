import React, { Suspense } from 'react'
import { LoginForm } from './_components/LoginForm'

export default function LoginPage() {
    return (
        <div className='pt-20 container mx-auto'>
            <Suspense>
                <LoginForm />
            </Suspense>
        </div>
    )
}

"use client"

import React from 'react'

import FullStar from "@/public/assets/stars/full.svg"
import HalfStar from "@/public/assets/stars/half.svg"
import EmptyStar from "@/public/assets/stars/empty.svg"
import Image from 'next/image'

export default function StarsComponent({ value }: { value: number }) {
    return (
        <div className='flex items-center'>
            {[1, 2, 3, 4, 5].map((star) => {
                if (value >= star) {
                    return <Image key={star} src={FullStar} alt='full star' />
                } else if (value + 0.5 >= star) {
                    return <Image key={star} src={HalfStar} alt='half star' />
                } else {
                    return <Image key={star} src={EmptyStar} alt='empty star' />
                }
            })}
        </div>
    )
}

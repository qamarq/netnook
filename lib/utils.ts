import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const formattedPrice = (price: number) => {
    // return `${price.toFixed(2)} zł`
    const formatter = new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
        minimumFractionDigits: 2,
    });

    // Zwróć sformatowaną cenę
    return formatter.format(price);
}

export const getPriceFromJSON = (json: string | null | undefined) => {
    if (!json) return formattedPrice(0)
    const parsed = JSON.parse(json)
    const price = parsed.data[0].unit_amount/100
    return formattedPrice(price)
}

export function formatDate(input: string | number): string {
    const date = new Date(input)
    return date.toLocaleDateString("pl-PL", {
        month: "long",
        day: "numeric",
        year: "numeric",
    })
}
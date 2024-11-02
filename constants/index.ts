import { Order, SpecificationType } from "@/payload-types";
import Stripe from "stripe";

export const orderStatuses: Record<Order["status"], string> = {
    'created': 'Utworzone',
    'paid': 'Opłacone',
    'processing': 'W trakcie realizacji',
    'shipped': 'Wysłane',
    'delivered': 'Dostarczone',
    'canceled': 'Anulowane'
}

export const paymentStatuses: Record<Stripe.PaymentIntent.Status, string> = {
    'canceled': 'Anulowane',
    'processing': 'Przetwarzanie',
    'requires_action': 'Wymaga akcji',
    'requires_capture': 'Wymaga przechwycenia',
    'requires_confirmation': 'Wymaga potwierdzenia',
    'requires_payment_method': 'Wymaga metody płatności',
    'succeeded': 'Opłacone',
}

export const specitifactionTypes: Record<SpecificationType, string> = {
    'height': 'Wysokość',
    'width': 'Szerokość',
    'depth': 'Głębokość',
    'weight': 'Waga',
    'manufacturerCode': 'Kod producenta',
    'accessories': 'Akcesoria',
    'additionalInfo': 'Dodatkowe informacje',
    'software': 'Oprogramowanie',
    'processor': 'Procesor',
    'ram': 'Pamięć RAM',
    'graphicsCard': 'Karta graficzna',
    'operatingSystem': 'System operacyjny',
    'warranty': 'Gwarancja',
    'screenType': 'Rodzaj ekranu',
    'screenSize': 'Rozmiar ekranu',
    'resolution': 'Rozdzielczość',
    'touchscreen': 'Ekran dotykowy',
    'color': 'Kolor',
    'connectivity': 'Złącza',
    'ports': 'Porty',
    'ssd_m2': 'SSD M.2',
    'sensors': 'Czujniki',
    'security': 'Zabezpieczenia',
    'powerSupply': 'Zasilanie'
}

export const paymentMethodLabels: Record<string, string> = {
    'card': 'Karta płatnicza',
    'p24': 'Płatność Przelewy24',
    'blik': 'Płatność BLIK'
}

export const stripeInvoiceStatuses: Record<Stripe.Invoice.Status, string> = {
    'draft': 'Szkic',
    'open': 'Otwarta',
    'paid': 'Opłacona',
    'uncollectible': 'Nieściągalna',
    'void': 'Anulowana',
    'deleted': 'Anulowana'
}
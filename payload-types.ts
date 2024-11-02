export interface Media {
    id: string;
    alt: string;
    caption?:
        | {
              [k: string]: unknown;
          }[]
        | null;
    updatedAt: Date;
    createdAt: Date;
    url?: string | null;
    thumbnailURL?: string | null;
    filename?: string | null;
    mimeType?: string | null;
    filesize?: number | null;
    width?: number | null;
    height?: number | null;
}

export type CartItems =
  | {
      product: Product
      quantity: number
      id: string
    }[]
  | null

export interface User {
    id: string;
    name: string | null;
    roles?: ('admin' | 'customer')[] | null;
    avatar?: Media | null;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    stripeCurrentPeriodEnd?: Date | null;
    skipSync?: boolean | null;
    updatedAt: Date;
    createdAt: Date;
    email: string;
    resetPasswordToken?: string | null;
    resetPasswordExpiration?: string | null;
    salt?: string | null;
    hash?: string | null;
    password: string | null;
    phone?: string | null;
    // paymentMethods?: {
    //     id: string;
    //     type: string;
    //     card: {
    //         brand: string;
    //         last4: string;
    //         exp_month: number;
    //         exp_year: number;
    //     };
    // }[];
    groupAddress?: {
        streetLine1: string;
        streetLine2?: string | null;
        city: string;
        zip: string;
        country: string;
        state: string | null;
    },
    groupAddressShipping?: {
        streetLine1: string;
        streetLine2?: string | null;
        city: string;
        zip: string;
        country: string;
        state: string | null;
        name: string;
        phone: string;
    };
    cart?: {
        items?: CartItems
    };
    purchases?: (string | Product)[] | null;
}

export type SubscriptionPlan = {
    name: string
    description: string
    stripePriceId: string
}

export type UserSubscriptionPlan = SubscriptionPlan &
  Pick<User, "stripeCustomerId" | "stripeSubscriptionId"> & {
    stripeCurrentPeriodEnd: number
    isPro: boolean
}

export interface Category {
    id: string;
    title: string;
    description: string;
    parent?: (string | null) | Category;
    breadcrumbs?:
        | {
              doc?: (string | null) | Category;
              url?: string | null;
              label?: string | null;
              id?: string | null;
          }[]
        | null;
    updatedAt: Date;
    createdAt: Date;
}

export interface Producer {
    id: string;
    title: string;
    parent?: Producer;
}

export type SpecificationType = 
    "height" | 
    "width" | 
    "depth" | 
    "weight" | 
    "manufacturerCode" | 
    "accessories" | 
    "additionalInfo" | 
    "software" | 
    "processor" | 
    "ram" | 
    "graphicsCard" | 
    "operatingSystem" | 
    "warranty" | 
    "screenType" | 
    "screenSize" | 
    "resolution" | 
    "touchscreen" | 
    "color" | 
    "connectivity" | 
    "ports" | 
    "ssd_m2" | 
    "sensors" |
    "security" |
    "powerSupply"

export interface Product {
    id: string;
    title: string;
    publishedOn?: string | null;
    description?: string | null;
    image?: Media | null;
    slider?: { id: string; image: Media }[];
    stripeProductID?: string | null;
    priceJSON?: string | null;
    price: number;
    producer: Producer;
    categories?: (Category)[];
    relatedProducts?: (string | Product)[] | null;
    slug?: string | null;
    skipSync?: boolean | null;
    meta?: {
        title?: string | null;
        description?: string | null;
        image?: string | Media | null;
    };
    updatedAt: Date;
    createdAt: Date;
    countOfOrders: number;
    specification?: {
        id: string;
        type: SpecificationType;
        value: string;
    }[];
    stock: number;
    _status?: ('draft' | 'published') | null;
}

export interface ShippingMethod {
    id: string;
    title: string;
    price: number;
    logo: Media;
    deliveryDaysTime: number;
    trackingUrl?: string | null;
    freeFrom?: number | null;
    type: ('courier' | 'parcel_locker' | 'pickup');
    paymentType: ('cash_on_delivery' | 'prepayment');
}

export interface Order {
    id: string
    orderedBy?: (string | null) | User
    stripePaymentIntentID?: string | null
    total: number
    status: ('created' | 'paid' | 'shipped' | 'processing' | 'delivered' | 'canceled')
    trackingNumber?: string | null
    trackingUrl?: string | null
    items?:
      | {
          product: string | Product
          price?: number | null
          quantity?: number | null
          id?: string | null
        }[]
      | null
    updatedAt: Date
    createdAt: Date
    shippingMethod?: (string | null) | ShippingMethod
}

export interface NotificationType {
    id: string
    title: string
    message: any
    message_html: string
    type: ('info' | 'warning' | 'error')
    read: boolean
    user: User
    createdAt: Date
    updatedAt: Date
}
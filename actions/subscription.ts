import { SubscriptionPlan, User, UserSubscriptionPlan } from "@/payload-types";
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@payload-config'
import { headers } from 'next/headers'
import { stripe } from "@/lib/stripe";

export const freePlan: SubscriptionPlan = {
    name: "Darmowy",
    description:
      "Dzięki planowi darmowemu możesz korzystać z wielu funkcji NetNooka, jednak niektóre z nich mogą być ograniczone.",
    stripePriceId: "",
}
  
export const proPlan: SubscriptionPlan = {
    name: "NetNookPRO",
    description: "Dzięki planowi NetNookPRO możesz zamawiać z darmową dostawą oraz korzystać z wielu innych korzyści.",
    stripePriceId: process.env.STRIPE_PRO_MONTHLY_PLAN_ID || "",
}

export async function getUserSubscriptionPlan(): Promise<UserSubscriptionPlan> {
    const payload = await getPayloadHMR({ config })
    const myHeaders = headers()
    const { user } = await payload.auth({ headers: myHeaders })

    if (!user) {
        throw new Error('User not found');
    }

    let currentUser: User = user as unknown as User;

    // Check if user is on a pro plan.
    let isPro =
        (currentUser.stripeCurrentPeriodEnd) ?
        new Date(currentUser.stripeCurrentPeriodEnd).getTime() + 86_400_000 > Date.now()
        : false;

    let subscription = null
    if (currentUser.stripeSubscriptionId) {
        subscription = await stripe.subscriptions.retrieve(currentUser.stripeSubscriptionId)
    }
    if (subscription && subscription.status === 'canceled') {
        isPro = false
        currentUser = (await payload.update({
            collection: 'users',
            id: currentUser.id,
            data: {
                stripeSubscriptionId: '',
                stripeCurrentPeriodEnd: 0,
            }
        })) as any
    }

    const plan = isPro ? proPlan : freePlan;

    return {
        ...currentUser,
        stripeCurrentPeriodEnd: currentUser.stripeCurrentPeriodEnd ? new Date(currentUser.stripeCurrentPeriodEnd).getTime() : 0,
        isPro,
        ...plan,
    } as any;
}

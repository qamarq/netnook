


export const deleteProductFromCarts: any = async ({ req, id }: { req: any, id: any}) => {
  const usersWithProductInCart = await req.payload.find({
    collection: 'users',
    overrideAccess: true,
    where: {
      'cart.items.product': {
        equals: id,
      },
    },
  })

  if (usersWithProductInCart.totalDocs > 0) {
    await Promise.all(
      usersWithProductInCart.docs.map(async (user: any) => {
        const cart = user.cart
        const itemsWithoutProduct = cart.items.filter((item: any) => item.product !== id)
        const cartWithoutProduct = {
          ...cart,
          items: itemsWithoutProduct,
        }

        return req.payload.update({
          collection: 'users',
          id: user.id,
          data: {
            cart: cartWithoutProduct,
          },
        })
      }),
    )
  }
}

import { OrderKitEntry, TicketFees } from './types.util'

export function orderedText(kits: OrderKitEntry[]) {
    let text = ''
    for (const k of kits) text += `> ${k.name}, **${k.amount}x**\n`
    return text
}

export function paymentText(productsPrice: number, tf: TicketFees) {
    let text = ''
    text += `> Товары: **${productsPrice} RUB**\n`

    const planting = Math.round(tf.planting)
    const spot = Math.round(tf.spot)

    if (tf.planting) text += `> Доставка на руки: **${planting} RUB**\n`
    if (tf.spot) text += `> Расстояние доставки: **${spot} RUB**\n`
    text += `__Итого__: **${productsPrice + planting + spot} RUB**\n`
    return text
}

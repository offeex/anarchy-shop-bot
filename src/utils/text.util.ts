import { OrderKitEntry, TicketFees } from './types.util'

export function orderedText(kits: OrderKitEntry[]) {
    let text = ''
    for (const k of kits) text += `> ${k.name}, **${k.amount}x**\n`
    return text
}

export function paymentText(productsPrice: number, tf: TicketFees) {
    let text = ''
    text += `> Товары: **${productsPrice} RUB**\n`
    if (tf.planting) text += `> Доставка на руки: **${tf.planting} RUB**\n`
    if (tf.spot) text += `> Расстояние доставки: **${tf.spot} RUB**\n`
    text += `__Итого__: **${productsPrice + tf.planting + tf.spot} RUB**\n`
    return text
}

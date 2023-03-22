import {OrderKitEntry} from './types.util'

export function orderedText(kits: OrderKitEntry[]) {
    let text = ''
    for (const k of kits) text += `> ${k.name}, **${k.amount}x**\n`
    return text
}

export function paymentText(productsPrice: number, plantingFee: number, spotFee: number) {
    let text = ''
    text += `> Товары: **${productsPrice} RUB**\n`
    if (plantingFee) text += `> Доставка на руки: **${plantingFee} RUB**\n`
    if (spotFee) text += `> Расстояние доставки: **${spotFee} RUB**\n`
    text += `__Итого__: **${productsPrice + plantingFee + spotFee} RUB**\n`
    return text
}

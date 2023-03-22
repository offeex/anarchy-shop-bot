import {Offer, OfferModel} from '../models/offer.model'
import {BaseMessageOptions, EmbedBuilder} from 'discord.js'
import {atmName, getAtm} from '../utils/discord.util'
import {getHexColor, getShulkerIcon} from '../utils/color.util'

export let offers: Offer[] = [
    {
        name: 'ПвП кит',
        category: 'наборы',
        price: 59,
        imageURL: 'https://media.discordapp.net/attachments/1059133352940159017/1059133614702481438/image.png',
        color: 'red',
        inStock: true
    },
    {
        name: 'Кит для выживания',
        category: 'наборы',
        price: 59,
        imageURL: 'https://media.discordapp.net/attachments/1059133352940159017/1059133679265394778/image.png',
        color: 'green',
        inStock: true
    },
    {
        name: 'Яблоки',
        category: 'пвп-регир',
        price: 59,
        imageURL: 'https://media.discordapp.net/attachments/1059133352940159017/1059134389784678560/image.png',
        color: 'yellow',
        inStock: true
    }
]

export async function createOffers() {
    try {
        for (const offer of offers) await OfferModel.create({...offer})
    } catch (e: any) {
        if (e.__proto__.name != 'MongoServerError' || e.code != 11000) throw e
    }
}

export function setupOfferPayload(o: Offer): BaseMessageOptions {
    const att = getAtm(getShulkerIcon(o.color), o.color + '.png')
    const embed = new EmbedBuilder()
        .setAuthor({name: o.name, iconURL: atmName(att)})
        .setColor(getHexColor(o.color))
        .setFields({name: 'Цена', value: `${o.price} RUB`})
        .setImage(o.imageURL)
        .setThumbnail(atmName(att))
    return {embeds: [embed], files: [att]}
}
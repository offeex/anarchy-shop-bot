import { OfferModel } from '../models/offer.model'

export async function setValue<T>(key: string, value: T): Promise<void> {
    await OfferModel.findOneAndUpdate(
        { key },
        { value: JSON.stringify(value) },
        { upsert: true }
    )
}

export async function setIfNotExists<T>(key: string, value: T): Promise<void> {
    try {
        await OfferModel.create({ key, value: JSON.stringify(value) })
    } catch (e: any) {
        if (e.__proto__.name != 'MongoServerError' || e.code != 11000)
            throw e
    }
}
import { getModelForClass, index, prop } from '@typegoose/typegoose'
import { Color } from '../utils/color.util'

@index({ name: 1, category: 1 }, { unique: true })
export class Offer {
	@prop() public name!: string
	@prop() public category!: string
	@prop({ default: 59 }) public price!: number // в рублях
	@prop() public imageURL!: string
	@prop() public color!: Color
	@prop({ default: true }) public inStock!: boolean
}

export const OfferModel = getModelForClass(Offer)
import { Offer } from '../models/offer.model'

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
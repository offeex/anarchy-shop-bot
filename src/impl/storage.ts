import { Offer, OfferModel } from '../models/offer.model'

enum ShulkerIcon {
	Red = 'https://media.discordapp.net/attachments/1002213251087605811/1002213318905299005/red.png',
	Lime = 'https://media.discordapp.net/attachments/1002213251087605811/1002213317353410591/lime.png',
	Yellow = 'https://media.discordapp.net/attachments/1002213251087605811/1002213319538651210/yellow.png',
	Orange = 'https://media.discordapp.net/attachments/1002213251087605811/1002213317965795399/orange.png',
	Magenta = 'https://media.discordapp.net/attachments/1002213251087605811/1002213317667991633/magenta.png',
	Green = 'https://media.discordapp.net/attachments/1002213251087605811/1002213305315766364/green.png',
	LightGray = 'https://media.discordapp.net/attachments/1002213251087605811/1002213305982656542/lightgray.png',
	Brown = 'https://media.discordapp.net/attachments/1002213251087605811/1002213304296550550/brown.png',
	Pink = 'https://media.discordapp.net/attachments/1002213251087605811/1002213318292938802/pink.png',
	Black = 'https://media.discordapp.net/attachments/1002213251087605811/1002213303671586876/black.png',
	Blue = 'https://media.discordapp.net/attachments/1002213251087605811/1002213303981981837/blue.png',
	LightBlue = 'https://media.discordapp.net/attachments/1002213251087605811/1002213305634521148/lightblue.png',
	White = 'https://media.discordapp.net/attachments/1002213251087605811/1002213319224074320/white.png',
	Purple = 'https://media.discordapp.net/attachments/1002213251087605811/1002213318603325440/purple.png',
}

export let offers: Offer[] = [
	{
		name: 'ПвП кит',
		category: 'наборы',
		price: 59,
		peekImageURL: 'https://media.discordapp.com/attachments/1059133352940159017/1059133614702481438/image.png',
		iconURL: ShulkerIcon.Red,
		inStock: true
	},
	{
		name: 'Кит для выживания',
		category: 'наборы',
		price: 59,
		peekImageURL: 'https://media.discordapp.net/attachments/1059133352940159017/1059133679265394778/image.png',
		iconURL: ShulkerIcon.Lime,
		inStock: true
	},
	{
		name: 'Яблоки',
		category: 'пвп-регир',
		price: 59,
		peekImageURL: 'https://media.discordapp.net/attachments/1059133352940159017/1059134389784678560/image.png',
		iconURL: ShulkerIcon.Yellow,
		inStock: true
	}
]

export async function initStorage() {
	try {
		for (const offer of offers) {
			await OfferModel.create({ ...offer })
		}
	} catch (e: any) {
		if (e.__proto__.name != 'MongoServerError' || e.code != 11000)
			throw e
	}
}
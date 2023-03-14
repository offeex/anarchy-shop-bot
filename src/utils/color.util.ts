import { globSync } from 'glob'
import { Colors } from 'discord.js'

export type Color =
	| 'red'
	| 'darkgreen'
	| 'yellow'
	| 'orange'
	| 'luminousvividpink'
	| 'green'
	| 'lightgrey'
	| 'brown'
	| 'fuchsia'
	| 'black'
	| 'blue'
	| 'blurple'
	| 'white'
	| 'purple'

export class ColorUtil {

	public static getHexColor(c: Color): any {
		return Object.entries(Colors).find(([k]) => k.toLowerCase() == c)![1]
	}

	public static getShulkerIcon(c: Color): string {
		return globSync(`${__dirname}/../static/${c}.png`)[0]
	}
}
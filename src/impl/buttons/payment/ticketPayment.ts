import Button from '../../../structures/Button'
import { toggleComponents } from '../../../utils/discord.util'
import { Attachment, Collection, Message, TextChannel } from 'discord.js'
import destr from 'destr'
import { client } from '../../../index'
import { getTicket, ticketStage } from '../../../managers/ticket.manager'
import { TicketStages } from '../../../utils/types.util'

function isImage(atts: Collection<string, Attachment>) {
	const isImageExtension = (url: string) => url.endsWith('.png')
		|| url.endsWith('.jpg')
		|| url.endsWith('.bmp')
	return atts.size >= 1 && atts.some(a => isImageExtension(a.url))
}

async function parseReceipt(ts: TicketStages, chan: TextChannel, content: string, msgTray: Message[]) {
	const msg = await chan.send(content)
	const res = (await chan.awaitMessages({ max: 1 })).first()!
	msgTray.push(msg, res)
	if (!isImage(res.attachments)) await parseReceipt(
		ts,
		chan,
		'Ты не прислал чек, попробуй снова',
		msgTray
	)
	await chan.bulkDelete(msgTray)
	ts.assertion = res
}

// for manual payment check
export default new Button('ticket-payment', async interaction => {
	const t = await getTicket(interaction)
	const ts = ticketStage(t)

	if (!ts.payment)
		return interaction.reply('Нет пути, сообщения об оплате выше не существует, пздц печально')

	ts.payment = await toggleComponents(ts.payment, true)
	const content =
		'Предоставь чек (скрин оплаты) следующим сообщением.\n' +
		'В противном случае тикет будет удалён автоматически'
	const chan = interaction.channel as TextChannel
	await interaction.deferReply()
	await parseReceipt(ts, chan, content, [])
	await interaction.editReply('Проверяем оплату, мы тебя уведомим когда проверим...')

	await chan.setRateLimitPerUser(300)
	for (const s of destr(process.env.SELLERS_IDS) as string[]) {
		const msg = `${interaction.user} предположил оплату на ${t.totalPrice} RUB: ${interaction.channel}`
		await client.users.send(s, msg)
	}
})
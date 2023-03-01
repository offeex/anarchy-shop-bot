import {
	ButtonInteraction,
	InteractionResponse,
	TextBasedChannel,
	ChannelType,
	PermissionsBitField,
} from 'discord.js';
import Button from '../interfaces/button';
import ColorUtil from '../utils/color-util';

export default class implements Button {
	public name = 'create-ticket';

	public async invoke(
		interaction: ButtonInteraction<'cached'>,
	): Promise<InteractionResponse | undefined> {
		// check if user have any existing tickets
		const existing = interaction.guild?.channels.cache.find((channel: any) =>
			channel.topic?.includes(interaction.member?.id),
		);
		if (existing) {
			return await interaction.reply({
				embeds: [
					{
						title: 'Ошибка',
						description: `У тебя уже открыт тикет!\nПроверь канал \`${existing.name}\``,
						color: ColorUtil.RED_COLOR,
					},
				],
				ephemeral: true,
			});
		}

		const ticket: TextBasedChannel = await interaction.guild?.channels.create({
			name: `👔┃покупка-${interaction.member?.displayName}`,
			type: ChannelType.GuildText,
			parent: process.env.TICKET_CATEGORY_ID,
			topic: `Канал, где покупает <@${interaction.member?.id}>`,
			permissionOverwrites: [
				{
					id: interaction.guild?.id,
					deny: [PermissionsBitField.Flags.ViewChannel],
				},
				{
					id: interaction.member?.id,
					allow: [
						PermissionsBitField.Flags.ViewChannel,
						PermissionsBitField.Flags.ReadMessageHistory,
						PermissionsBitField.Flags.SendMessages,
					],
				},
			],
		});

		await interaction.reply({
			embeds: [
				{
					title: 'Тикет успешно создан',
					description: `Перейди в канал \`${ticket.name}\``,
					color: ColorUtil.GREEN_COLOR,
				},
			],
			ephemeral: true,
		});

		const message = await ticket.send('@everyone');
		message.delete();
	}
}

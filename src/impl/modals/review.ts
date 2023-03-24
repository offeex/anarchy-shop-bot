import Modal from '../../structures/Modal'
import { EmbedBuilder, TextChannel } from 'discord.js'

export default new Modal('review-modal', async interaction => {
    await interaction.deferReply()
    const chan = (await interaction.guild!.channels.fetch(
      process.env.REVIEW_CHANNEL_ID!
    )) as TextChannel
    if (!chan) return

    const embed = new EmbedBuilder()
      .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL()! })
      .setDescription(interaction.fields.getTextInputValue('review-text')!)
      .setColor('Random')
      .setFooter({ text: 'Айди заказа: ' + interaction.channelId })

    await chan.send({ embeds: [embed] })
})
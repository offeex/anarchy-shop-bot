import { ButtonInteraction, ButtonStyle } from 'discord.js'
import Button from '../../structures/Button'

export default new Button(
  'create-ticket',
  async (interaction: ButtonInteraction) => {
    // TODO: Лемолям прописуй логику
    interaction.reply('Создание тикета')
})

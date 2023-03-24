import Button from "../../../structures/Button";
import { ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { actionRow } from "../../../utils/discord.util";

export default new Button(
  'review',
  async (interaction) => {
    const modal = new ModalBuilder()
      .setCustomId('review-modal')
      .setTitle('Отзыв')
      .setComponents(actionRow(new TextInputBuilder()
        .setCustomId('review-text')
        .setLabel('Впиши сюда свой отзыв')
        .setPlaceholder('Расскажи, насколько быстро и качественно ты получил свой заказ!')
        .setStyle(TextInputStyle.Short)
      ))

    await interaction.showModal(modal)
  }
)
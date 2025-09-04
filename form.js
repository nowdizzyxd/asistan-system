const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'form',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setDescription('<:Bot:1407644781760221318> **Yetkili Başvuru Sistemi**\n\nAşağıdaki butona basarak formu doldurabilirsiniz.')
            .setImage('https://cdn.discordapp.com/attachments/1406724043746443315/1408894809543802900/Picsart_25-08-23_22-17-19-429.png');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_form_modal')
                .setLabel('📋 Formu Aç')
                .setStyle(ButtonStyle.Primary)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete().catch(() => {});
    }
};
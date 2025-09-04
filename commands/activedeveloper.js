const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'activedeveloper',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('<a:activedeveloperbadge_em:1409145239490531443> Active Developer Rolü')
            .setDescription('Eğer **Active Developer** rozetine sahipsen, aşağıdaki butona basarak rolünü alabilirsin!')
            .setThumbnail('https://cdn.discordapp.com/emojis/1409145239490531443.gif?size=48')
            .setImage('https://cdn.discordapp.com/attachments/1406724043746443315/1409148304922644552/Picsart_25-08-24_15-12-00-562.jpg')
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('get_active_dev_role')
                .setLabel('Rol Al')
                .setStyle(ButtonStyle.Primary)
        );

        await message.channel.send({ embeds: [embed], components: [row] });
        await message.delete().catch(() => {});
    }
};
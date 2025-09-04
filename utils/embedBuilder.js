const { EmbedBuilder } = require('discord.js');

function createScreenshotEmbed(imageUrl, author) {
    const embed = new EmbedBuilder()
        .setTitle('Abone Ss')
        .setDescription('Sadece Yetkilileri Bekleyiniz.')
        .setImage(imageUrl)
        .setColor(0x2F3136)
        .setThumbnail(author.displayAvatarURL({ dynamic: true, size: 64 }))
        .setFooter({
            text: 'Valknut Development 💖',
            iconURL: author.client?.user?.displayAvatarURL() || null
        })
        .setTimestamp();

    return embed;
}

module.exports = {
    createScreenshotEmbed
};

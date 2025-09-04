const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'hakkımızda',
    async execute(message) {
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('<a:PIKASALUT:1407644902023757864> Hakkımızda')
            .setDescription(
                '**Valknut Development** ``2023`` yılından beri bir **CodeShare / Altyapı Sunucusudur.**\n\n' +
                '<a:HypeSquadBadge_2:1407720251864649789> Burada **hazır ücretsiz sistemler** kullanabilirsiniz.\n' +
                '<a:youtube:1407674945189707796> **<#1408878685775200266>** kanalından altyapılardan yararlanabilirsiniz.\n' +
                '<a:BoosterBadges:1407705279201677463> **Boost** ile **Gelişmiş Altyapılar** alabilirsiniz.\n' +
                '<:Vip:1407644821853573150> **Abone SS** ile ücretsiz altyapılardan faydalanabilirsiniz!'
            )
            .setImage('https://cdn.discordapp.com/attachments/1406724043746443315/1409044919766614087/Picsart_25-08-24_08-21-17-675.jpg')
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
        await message.delete().catch(() => {});
    }
};
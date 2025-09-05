const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { MONITOR_CHANNEL_ID, TAG_ROLE_ID } = process.env;
const { createScreenshotEmbed } = require('../utils/embedBuilder');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;

        // ---------- .ticket Komutu ----------
        if (message.content.toLowerCase() === '.ticket') {
            try {
                const ticketEmbed = new EmbedBuilder()
                    .setTitle('<a:HypeSquadBadge_2:1407720251864649789> Ticket Sistemi')
                    .setDescription('Aldığınız hatayı veya sunucu içindeki sorunları bize bildirin <a:Moderator_Programs_Alumni_a:1407690201429446736>\n\nValkNut Development <a:cwiggle_Toxic:1407720295871152128>')
                    .setColor(0x2F3136)
                    .setImage('https://cdn.discordapp.com/attachments/1406724043746443315/1408892248254316645/Picsart_25-08-23_22-11-25-372.png?ex=68ab64a7&is=68aa1327&hm=5d3a37c136d9ffcf01435eac05f31754ab16f836ec7a6def15c559003cb5f0de&')
                    .setFooter({
                        text: 'Ticket System',
                        iconURL: client.user.displayAvatarURL()
                    })
                    .setTimestamp();

                const ticketRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('create_ticket')
                            .setLabel('🎫 Ticket Oluştur')
                            .setStyle(ButtonStyle.Primary)
                    );

                await message.channel.send({
                    embeds: [ticketEmbed],
                    components: [ticketRow]
                });

                await message.delete().catch(() => {});
                return;
            } catch (error) {
                console.error('Ticket paneli oluşturulurken hata:', error);
                return;
            }
        }

        // ---------- MONITOR_CHANNEL_ID İçin Abone SS ----------
        if (message.channel.id === MONITOR_CHANNEL_ID) {
            const imageAttachments = message.attachments.filter(attachment => {
                const validTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp'];
                return validTypes.includes(attachment.contentType);
            });

            if (imageAttachments.size > 0) {
                try {
                    const imageAttachment = imageAttachments.first();
                    const embed = createScreenshotEmbed(imageAttachment.url, message.author);

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`approve_${message.author.id}_${message.id}`)
                                .setLabel('Onayla')
                                .setEmoji('✅')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId(`reject_${message.author.id}_${message.id}`)
                                .setLabel('Reddet')
                                .setEmoji('❌')
                                .setStyle(ButtonStyle.Danger)
                        );

                    const roleToTag = message.guild.roles.cache.get(TAG_ROLE_ID);
                    const roleContent = roleToTag ? `<@&${TAG_ROLE_ID}>` : '';

                    await message.channel.send({
                        content: roleContent,
                        embeds: [embed],
                        components: [row]
                    });

                    console.log(`📸 Abone SS doğrulama isteği oluşturuldu: ${message.author.tag}`);

                } catch (error) {
                    console.error('AboneSS işlenirken hata:', error);

                    await message.channel.send({
                        content: '❌ Abone SS işlenirken bir hata oluştu. Lütfen tekrar deneyin.',
                        ephemeral: true
                    }).catch(console.error);
                }
            }
        }

        // ---------- Genel Komut İşleme ----------
        if (message.content.startsWith('.')) {
            const args = message.content.slice(1).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            const command = client.commands.get(commandName);
            if (command) {
                try {
                    await command.execute(message, args, client);
                } catch (error) {
                    console.error(`Komut çalıştırılırken hata oluştu: ${error}`);
                }
            }
        }
    }
};
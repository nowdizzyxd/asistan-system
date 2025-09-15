const { ASSIGN_ROLE_ID, TICKET_CATEGORY_ID, TICKET_ROLE_ID, FORM_LOG_CHANNEL_ID } = process.env;

const { PermissionFlagsBits, ChannelType, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {

    name: Events.InteractionCreate,

    async execute(interaction, client) {

        // 📌 FORM AÇ

        if (interaction.isButton() && interaction.customId === 'open_form_modal') {

            const modal = new ModalBuilder()

                .setCustomId('yetkili_form')

                .setTitle('📋 Yetkili Başvuru Formu');

            const q1 = new TextInputBuilder()

                .setCustomId('form_ad')

                .setLabel('Adınız / Kullanıcı Adınız')

                .setStyle(TextInputStyle.Short)

                .setRequired(true);

            const q2 = new TextInputBuilder()

                .setCustomId('form_yas')

                .setLabel('Yaşınız')

                .setStyle(TextInputStyle.Short)

                .setRequired(true);

            const q3 = new TextInputBuilder()

                .setCustomId('form_neden')

                .setLabel('Neden yetkili olmak istiyorsunuz?')

                .setStyle(TextInputStyle.Paragraph)

                .setRequired(true);

            const row1 = new ActionRowBuilder().addComponents(q1);

            const row2 = new ActionRowBuilder().addComponents(q2);

            const row3 = new ActionRowBuilder().addComponents(q3);

            modal.addComponents(row1, row2, row3);

            await interaction.showModal(modal);

            return;

        }

        // 📌 FORM GÖNDERİLDİ

        if (interaction.isModalSubmit() && interaction.customId === 'yetkili_form') {

            const name = interaction.fields.getTextInputValue('form_ad');

            const age = interaction.fields.getTextInputValue('form_yas');

            const reason = interaction.fields.getTextInputValue('form_neden');

            // kullanıcıya bilgi

            await interaction.reply({ content: '✅ Başvurunuz alınmıştır, teşekkürler!', ephemeral: true });

            // log kanalına gönder

            const logChannel = interaction.guild.channels.cache.get(FORM_LOG_CHANNEL_ID);

            if (logChannel) {

                logChannel.send({

                    embeds: [{

                        title: '📋 Yeni Yetkili Başvurusu',

                        color: 0x3498db,

                        fields: [

                            { name: '👤 Kullanıcı', value: `${interaction.user} (${interaction.user.tag})`, inline: false },

                            { name: '📛 İsim', value: name, inline: true },

                            { name: '🎂 Yaş', value: age, inline: true },

                            { name: '📝 Neden', value: reason, inline: false }

                        ],

                        timestamp: new Date().toISOString()

                    }]

                });

            }

            return;

        }

        // 📌 ROL MENÜSÜ

        if (interaction.isStringSelectMenu() && interaction.customId === 'role_menu') {

            const roleId = interaction.values[0];

            const member = await interaction.guild.members.fetch(interaction.user.id);

            if (member.roles.cache.has(roleId)) {

                await member.roles.remove(roleId);

                return interaction.reply({ content: `❌ Rol kaldırıldı: <@&${roleId}>`, ephemeral: true });

            } else {

                await member.roles.add(roleId);

                return interaction.reply({ content: `✅ Rol eklendi: <@&${roleId}>`, ephemeral: true });

            }

        }

        // 📌 TICKET OLUŞTUR

        if (interaction.isButton() && interaction.customId === 'create_ticket') {

            try {

                const guild = interaction.guild;

                const user = interaction.user;

                const existingTicket = guild.channels.cache.find(channel =>

                    channel.name === `ticket-${user.username.toLowerCase()}` &&

                    channel.parentId === TICKET_CATEGORY_ID

                );

                if (existingTicket) {

                    return await interaction.reply({

                        content: `❌ Zaten açık bir ticketınız var: ${existingTicket}`,

                        flags: 64

                    });

                }

                const ticketChannel = await guild.channels.create({

                    name: `ticket-${user.username.toLowerCase()}`,

                    type: ChannelType.GuildText,

                    parent: TICKET_CATEGORY_ID,

                    permissionOverwrites: [

                        { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },

                        { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },

                        { id: TICKET_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages] }

                    ]

                });

                const ticketWelcomeEmbed = {

                    title: '🎫 Ticket Oluşturuldu',

                    description: `Merhaba ${user}, ticketınız başarıyla oluşturuldu!\n\nLütfen sorunuzu detaylı bir şekilde açıklayın. Bir yetkili en kısa sürede size yardımcı olacaktır.`,

                    color: 0x00FF00,

                    footer: { text: 'Ticket' },

                    timestamp: new Date().toISOString()

                };

                const closeRow = {

                    type: 1,

                    components: [

                        { type: 2, style: 4, label: '🔒 Ticket\'ı Kapat', custom_id: 'close_ticket' }

                    ]

                };

                await ticketChannel.send({

                    content: `<@${user.id}> <@&${TICKET_ROLE_ID}>`,

                    embeds: [ticketWelcomeEmbed],

                    components: [closeRow]

                });

                await interaction.reply({

                    content: `✅ Ticketınız oluşturuldu: ${ticketChannel}`,

                    flags: 64

                });

                console.log(`🎫 Ticket oluşturuldu: ${ticketChannel.name} - ${user.tag}`);

            } catch (error) {

                console.error('Ticket oluşturulurken hata:', error);

                await interaction.reply({

                    content: '❌ Ticket oluşturulurken bir hata oluştu. Lütfen bir moderatörle iletişime geçin.',

                    flags: 64

                }).catch(console.error);

            }

            return;

        }

        // 📌 TICKET KAPAT

        if (interaction.isButton() && interaction.customId === 'close_ticket') {

            try {

                const member = interaction.member;

                const channel = interaction.channel;

                const hasPermission = member.permissions.has(PermissionFlagsBits.ManageChannels) ||

                                      member.roles.cache.has(TICKET_ROLE_ID) ||

                                      channel.name === `ticket-${member.user.username.toLowerCase()}`;

                if (!hasPermission) {

                    return await interaction.reply({

                        content: '❌ Bu ticket\'ı kapatma yetkiniz yok!',

                        flags: 64

                    });

                }

                await interaction.reply({

                    content: '🔒 Ticket 5 saniye içinde kapatılacak...',

                    flags: 64

                });

                setTimeout(async () => {

                    try {

                        await channel.delete();

                        console.log(`🔒 Ticket kapatıldı: ${channel.name} - ${member.user.tag}`);

                    } catch (error) {

                        console.error('Ticket kanalı silinirken hata:', error);

                    }

                }, 5000);

            } catch (error) {

                console.error('Ticket kapatılırken hata:', error);

                await interaction.reply({

                    content: '❌ Ticket kapatılırken bir hata oluştu.',

                    flags: 64

                }).catch(console.error);

            }

            return;

        }

        // 📌 Abone ONAY / RED

        if (interaction.isButton()) {

            const [action, userId, messageId] = interaction.customId.split('_');

            if (!['approve', 'reject'].includes(action)) return;

            try {

                const member = interaction.member;

                const hasModeratorPermissions = member.permissions.has('ManageRoles') ||

                                                member.permissions.has('ModerateMembers') ||

                                                member.permissions.has('Administrator');

                if (!hasModeratorPermissions) {

                    return await interaction.reply({

                        content: '❌ Bu butonu kullanma yetkiniz yok!',

                        ephemeral: true

                    });

                }

                const targetUser = await interaction.guild.members.fetch(userId).catch(() => null);

                if (!targetUser) {

                    return await interaction.reply({

                        content: '❌ Kullanıcı bulunamadı!',

                        ephemeral: true

                    });

                }

                if (action === 'approve') {

                    const roleToAssign = interaction.guild.roles.cache.get(ASSIGN_ROLE_ID);

                    if (!roleToAssign) {

                        return await interaction.reply({

                            content: '❌ Verilecek rol bulunamadı!',

                            ephemeral: true

                        });

                    }

                    if (targetUser.roles.cache.has(ASSIGN_ROLE_ID)) {

                        return await interaction.reply({

                            content: '✅ Kullanıcı zaten bu role sahip!',

                            ephemeral: true

                        });

                    }

                    await targetUser.roles.add(roleToAssign);

                    const originalEmbed = interaction.message.embeds[0];

                    const updatedEmbed = {

                        ...originalEmbed.data,

                        title: '✅ Onaylandı - Abone Ss',

                        description: `${interaction.user.tag} tarafından onaylandı.`,

                        color: 0x00FF00

                    };

                    await interaction.update({ embeds: [updatedEmbed], components: [] });

                    await interaction.followUp({

                        content: `✅ <@${userId}> Abone Ss rolünüz verilmiştir`,

                        ephemeral: false

                    });

                    console.log(`✅ Screenshot onaylandı: ${targetUser.user.tag} - ${interaction.user.tag}`);

                } else if (action === 'reject') {

                    const originalEmbed = interaction.message.embeds[0];

                    const updatedEmbed = {

                        ...originalEmbed.data,

                        title: '❌ Reddedildi - Abone Ss',

                        description: `${interaction.user.tag} tarafından reddedildi.`,

                        color: 0xFF0000

                    };

                    await interaction.update({ embeds: [updatedEmbed], components: [] });

                    await interaction.followUp({

                        content: `❌ <@${userId}> Eksik veya yanlış ss attınız`,

                        ephemeral: false

                    });

                    console.log(`❌ Screenshot reddedildi: ${targetUser.user.tag} - ${interaction.user.tag}`);

                }

            } catch (error) {

                console.error('Buton etkileşimi işlenirken hata:', error);

                const errorMessage = error.code === 50013

                    ? '❌ Bot\'un bu işlemi gerçekleştirmek için yeterli yetkisi yok!'

                    : '❌ İşlem sırasında bir hata oluştu!';

                if (!interaction.replied && !interaction.deferred) {

                    await interaction.reply({

                        content: errorMessage,

                        ephemeral: true

                    }).catch(console.error);

                }

            }

        }

    }

};

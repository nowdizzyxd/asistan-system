const { 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    StringSelectMenuOptionBuilder 
} = require('discord.js');

module.exports = {
    name: 'rol-menubuton',
    async execute(message) {
        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('role_menu')
                .setPlaceholder('Tıkla')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('• JavaScript')
                        .setDescription('JavaScript')
                        .setValue('1407644345741611108')
                        .setEmoji({ id: '1409154321941008507' }),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('• TypeScript')
                        .setDescription('TypeScript')
                        .setValue('1407644340649594970')
                        .setEmoji({ id: '1409154321941008507' }),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('• Python')
                        .setDescription('Python')
                        .setValue('1407644336081866812')
                        .setEmoji({ id: '1409154321941008507' }),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('• HTML')
                        .setDescription('HTML')
                        .setValue('1407644338015698966')
                        .setEmoji({ id: '1409154321941008507' }),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('• CSS')
                        .setDescription('CSS')
                        .setValue('1407644343476686849')
                        .setEmoji({ id: '1409154321941008507' }),
                )
        );

        await message.channel.send({ 
            content: '<a:dev:1409154321941008507> Rol seçmek için aşağıdaki seçmeli menüyü kullanın', 
            components: [menu] 
        });

        await message.delete().catch(() => {});
    }
};
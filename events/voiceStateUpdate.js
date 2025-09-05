const { VOICE_CHANNEL_ID } = process.env;

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState, client) {
        const targetChannelId = VOICE_CHANNEL_ID;
        
        if (newState.channelId === targetChannelId && oldState.channelId !== targetChannelId) {
            try {
                const botMember = newState.guild.members.cache.get(client.user.id);
                if (botMember.voice.channelId === targetChannelId) {
                    console.log('🔊 Bot zaten ses kanalında');
                    return;
                }

                const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
                
                const connection = joinVoiceChannel({
                    channelId: targetChannelId,
                    guildId: newState.guild.id,
                    adapterCreator: newState.guild.voiceAdapterCreator,
                    selfDeaf: false,
                    selfMute: false
                });

                console.log(`🔊 Bot ses kanalına bağlanıyor: ${newState.channel.name}`);

                try {
                    await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
                    console.log('🎤 Ses bağlantısı hazır ve stabil');
                } catch (error) {
                    console.error('Ses bağlantısı kurulamadı:', error);
                    connection.destroy();
                }

                connection.on(VoiceConnectionStatus.Disconnected, async () => {
                    try {
                        await Promise.race([
                            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                            entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                        ]);
                    } catch (error) {
                        connection.destroy();
                        console.log('🔇 Bot ses kanalından ayrıldı');
                    }
                });

            } catch (error) {
                console.error('Ses kanalına bağlanırken hata:', error);
            }
        }
        
        if (oldState.channelId === targetChannelId && !newState.channelId) {
            try {
                const channel = oldState.channel;
                const membersInChannel = channel.members.filter(member => !member.user.bot).size;
                
                if (membersInChannel === 0) {
                    const { getVoiceConnection } = require('@discordjs/voice');
                    const connection = getVoiceConnection(oldState.guild.id);
                    
                    if (connection) {
                        connection.destroy();
                        console.log(`🔇 Bot ses kanalından ayrıldı: ${channel.name} (kalan üye yok)`);
                    }
                }
            } catch (error) {
                console.error('Ses kanalından ayrılırken hata:', error);
            }
        }
    }
};
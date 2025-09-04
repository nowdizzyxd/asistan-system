const { Client, GatewayIntentBits, Collection } = require('discord.js');

const fs = require('fs');

const path = require('path');

require('dotenv').config();

const client = new Client({

    intents: [

        GatewayIntentBits.Guilds,

        GatewayIntentBits.GuildMessages,

        GatewayIntentBits.MessageContent,

        GatewayIntentBits.GuildMembers,

        GatewayIntentBits.GuildVoiceStates,

        GatewayIntentBits.GuildPresences,

        GatewayIntentBits.GuildBans

    ]

});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {

    const filePath = path.join(commandsPath, file);

    const command = require(filePath);

    if ('name' in command && 'execute' in command) {

        client.commands.set(command.name, command);

    }

}

const eventsPath = path.join(__dirname, 'events');

const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {

    const filePath = path.join(eventsPath, file);

    const event = require(filePath);

    if (event.once) {

        client.once(event.name, (...args) => event.execute(...args, client));

    } else {

        client.on(event.name, (...args) => event.execute(...args, client));

    }

}

client.on('messageCreate', async message => {

    if (!message.content.startsWith('.') || message.author.bot) return;

    const args = message.content.slice(1).trim().split(/ +/);

    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);

    if (!command) return;

    try {

        await command.execute(message, args, client);

    } catch (error) {

        console.error(error);

        message.reply('Komut çalıştırılırken bir hata oluştu.');

    }

});

client.once('ready', async () => {

    console.log(`✅ Bot hazır! Giriş yaptı: ${client.user.tag}`);

    console.log(`📊 İzlenen kanal: ${process.env.MONITOR_CHANNEL_ID || '1407644675799519342'}`);

    try {

        await client.user.setPresence({

            activities: [{ name: 'ValknutDevelopment', type: 0 }],

            status: 'online'

        });

        console.log('🎮 Bot durumu ayarlandı: ValknutDevelopment oynuyor');

    } catch (error) {

        console.error('Bot durumu ayarlanamadı:', error);

    }

    setTimeout(async () => {

        try {

            const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require('@discordjs/voice');

            const hedefKanalId = '1407644708687056999';

            const sunucu = client.guilds.cache.first();

            if (!sunucu) return;

            const sesKanal = sunucu.channels.cache.get(hedefKanalId);

            if (!sesKanal) return;

            console.log(`🔊 Ses kanalına katılma denemesi: ${sesKanal.name}`);

            const baglanti = joinVoiceChannel({

                channelId: hedefKanalId,

                guildId: sunucu.id,

                adapterCreator: sunucu.voiceAdapterCreator,

                selfDeaf: true,

                selfMute: true

            });

            baglanti.on(VoiceConnectionStatus.Ready, () => {

                console.log('🎤 Ses bağlantısı hazır!');

            });

            baglanti.on(VoiceConnectionStatus.Disconnected, async () => {

                console.log('🔇 Ses bağlantısı kesildi, yeniden bağlanılıyor...');

                try {

                    await Promise.race([

                        entersState(baglanti, VoiceConnectionStatus.Signalling, 5000),

                        entersState(baglanti, VoiceConnectionStatus.Connecting, 5000),

                    ]);

                } catch (error) {

                    console.log('🔇 Yeniden bağlanma başarısız, bağlantı sonlandırılıyor');

                    baglanti.destroy();

                    setTimeout(() => {

                        console.log('🔄 Bağlantı tekrar deneniyor...');

                        client.emit('ready');

                    }, 10000);

                }

            });

            baglanti.on(VoiceConnectionStatus.Destroyed, () => {

                console.log('💥 Ses bağlantısı sonlandırıldı');

            });

        } catch (error) {

            console.error('Ses bağlantısı kurulurken hata oluştu:', error);

        }

    }, 5000);

    setInterval(() => {

        const { getVoiceConnection } = require('@discordjs/voice');

        const baglanti = getVoiceConnection(client.guilds.cache.first()?.id);

        if (baglanti) {

            console.log('💓 Ses bağlantısı kalp atışı - Durum:', baglanti.state.status);

        }

    }, 60000);

});

client.on('error', error => {

    console.error('Discord istemci hatası:', error);

});

process.on('unhandledRejection', error => {

    console.error('Yakalanmamış promise hatası:', error);

});

const token = process.env.DISCORD_TOKEN;

if (!token) {

    console.error('❌ DISCORD_TOKEN çevresel değişkenlerinde bulunamadı!');

    process.exit(1);

}

client.login(token).catch(error => {

    console.error('❌ Giriş yapılamadı:', error);

    process.exit(1);

});

const Logger = require('oxylogger');

const logger = new Logger(client);

logger.options = {

    prefix: '.',

    logac: 'log-ekle',

    logkapa: 'log-sil'

};

const Oxy = require('discord.js-vsc');

const bot = new Oxy(client);

bot.ikiban({

    main: '1406715304280588419',

    yan: '1408162768497938554',

    bansebep: 'Guard tarafından engellendi.',

    log: '1406724043746443315',

    action: 'ban'

});
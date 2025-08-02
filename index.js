const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');



const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Scan the QR code with your WhatsApp');
});



client.on('ready', async () => {
    console.log('✅ Client is ready!');
    try {
        if (!fs.existsSync('chats')) {
            fs.mkdirSync('chats');
        }

        const allChats = await client.getChats();
        const oneToOneChats = allChats.filter(chat => !chat.isGroup);
        console.log(`You have ${oneToOneChats.length} chats.`);

        for (const chat of oneToOneChats) {

            const messages = await chat.fetchMessages({ limit: 500 });

            if (!messages.length) continue;

            const contact = await chat.getContact();
            const filename = `${contact.number}.json`;
            const filepath = path.join('chats', filename);

            // Prepare messages as JSON lines
            const messageLines = messages
                .filter(msg => msg.body && msg.body.trim())
                .map(msg => ({
                    msg: msg.body.trim(),
                    sender: msg.from.replace(/@c\.us$/, ''),
                    time: msg.timestamp ? new Date(msg.timestamp * 1000).toISOString() : null
                }));

            if (messageLines.length) {
                try {
                    await fs.promises.appendFile(filepath, JSON.stringify(messageLines));
                    console.log(`📝 Logged ${messageLines.length} messages to ${filename}`);
                } catch (err) {
                    console.error('❌ Error writing to file:', err);
                }
            }
        }
        console.log('✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error fetching chats:', error);
    }
});



client.initialize();

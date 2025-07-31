const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');

const qrcode = require('qrcode-terminal');

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
        const chats = await client.getChats();
        console.log(`You have ${chats.length} chats.`);
        chats.forEach(async chat => {
            const messages = await chat.fetchMessages({ fromMe: false, limit: 100 });
            messages.forEach(msg => {
                const messageBody = msg.body.trim();
                if (!messageBody) return;
                fs.appendFile('messages.log', messageBody + '\n', (err) => {
                    if (err) {
                        console.error('❌ Error writing to file:', err);
                    } else {
                        console.log('📝 Logged message:', messageBody);
                    }
                });
            });
        });
    } catch (error) {
        console.error('Error fetching chats:', error);
    }
});

client.on('message', async (message) => {
    console.log(`📥 ${message.from}: ${message.body}`);


});

client.initialize();

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser');

// Инициализация клиента
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});


// Генерация QR-кода
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// При успешном подключении
client.on('ready', () => {
    console.log('WhatsApp бот готов!');
});

// Обработчик входящих сообщений
client.on('message', message => {
    console.log(message.body);
    // Здесь можно добавить логику обработки сообщений
});

// Запуск клиента
client.initialize();

// Создание API-сервера
const app = express();
app.use(bodyParser.json());

// API для отправки сообщений
app.post('/send-message', (req, res) => {
    const { phoneNumber, message } = req.body;
    if (!phoneNumber || !message) {
        return res.status(400).send('Неверные параметры');
    }

    const chatId = `${phoneNumber}@c.us`;
    client.sendMessage(chatId, message).then(response => {
        res.status(200).send('Сообщение отправлено');
    }).catch(error => {
        res.status(500).send('Ошибка при отправке сообщения');
    });
});

// Запуск API-сервера на порту 3000
const server = app.listen(3000, () => {
    console.log('API-сервер работает на http://localhost:3000');
});

// Обработка завершения работы (например, при нажатии Ctrl+C)
process.on('SIGINT', async () => {
    console.log('Получен сигнал завершения. Завершаем работу...');
    try {
        await client.destroy(); // Останавливаем WhatsApp клиента
        server.close(() => {
            console.log('API-сервер остановлен');
            process.exit(0); // Завершаем процесс
        });
    } catch (error) {
        console.error('Ошибка при завершении работы:', error);
        process.exit(1); // Завершаем с ошибкой, если не удалось остановить клиент
    }
});

process.on('SIGTERM', async () => {
    console.log('Получен сигнал SIGTERM. Завершаем работу...');
    try {
        await client.destroy(); // Останавливаем WhatsApp клиента
        server.close(() => {
            console.log('API-сервер остановлен');
            process.exit(0); // Завершаем процесс
        });
    } catch (error) {
        console.error('Ошибка при завершении работы:', error);
        process.exit(1); // Завершаем с ошибкой, если не удалось остановить клиент
    }
});

const express = require('express');
const multer = require('multer');
const { Client, GatewayIntentBits } = require('discord.js');
const Tesseract = require('tesseract.js');
const fs = require('fs').promises; // Para manejar el archivo JSON de usuarios
const path = require('path');
require('dotenv').config();  // Cargar variables de entorno

const app = express();
const upload = multer();
const PORT = process.env.PORT || 3000;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.once('ready', () => {
    console.log('Bot is ready');
});

client.login(process.env.DISCORD_TOKEN);  // Usar token de Discord desde el archivo .env

app.use(express.static('public'));
app.use(express.json({ limit: '10mb' }));

// Ruta al archivo users.json
const usersFilePath = path.join(__dirname, 'users.json');

// Función para cargar los usuarios
async function loadUsers() {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(data);
}

// Función para guardar los usuarios
async function saveUsers(users) {
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
}

// Incrementar el contador de facturas del usuario
async function incrementInvoiceCount(channelId) {
    console.log(`Buscando usuario con channelId: ${channelId}`); // Línea para depuración
    const users = await loadUsers();
    const user = users.find(u => u.channelId === channelId);
    if (user) {
        user.invoiceCount = (user.invoiceCount || 0) + 1;
        await saveUsers(users);
        return user.invoiceCount;
    }
    throw new Error('Usuario no encontrado');
}

app.post('/recognize-text', upload.single('image'), async (req, res) => {
    try {
        const image = req.file;
        const buffer = image.buffer;

        Tesseract.recognize(buffer, 'eng', {
            logger: (m) => console.log(m)
        }).then(({ data: { text } }) => {
            res.json({ text });
        }).catch(error => {
            console.error('Error in OCR:', error);
            res.status(500).json({ error: 'Failed to recognize text' });
        });
    } catch (error) {
        console.error('Error recognizing text:', error);
        res.status(500).json({ error: 'Failed to recognize text' });
    }
});
app.post('/send-shift', async (req, res) => {
    try {
        const { message } = req.body;
        const channelId = '1270954086765953107'; // Canal correcto para el envío de horarios

        // Enviar el mensaje de horario a Discord
        const sentMessage = await client.channels.cache.get(channelId).send(message);

        // Guardar el ID del mensaje para futuras ediciones (opcional si deseas editar después)
        const messageId = sentMessage.id;

        res.json({ message: 'Horario enviado a Discord exitosamente', messageId });
    } catch (error) {
        console.error('Error enviando el horario a Discord:', error);
        res.status(500).json({ error: 'Error al enviar el horario a Discord' });
    }
});



app.post('/send-to-discord', upload.single('screenshot'), async (req, res) => {
    try {
        const screenshot = req.file;
        const invoiceText = req.body.invoiceText;
        const invoiceSimpleText = req.body.invoiceSimpleText;
        const invoicePersonalText = req.body.invoicePersonalText;
        const channelId = req.body.channelId; // Obtener el channelId desde la solicitud

        // Incrementar el contador de facturas para el usuario
        const invoiceCount = await incrementInvoiceCount(channelId);

        // Personalizar el texto de la factura con el número total de facturas del usuario
        const personalizedInvoiceText = `${invoicePersonalText}\nTotal Facturas: ${invoiceCount}`;

        const simpleTextChannelId = '1256671060833603584'; // Canal general

        // Enviar a bitácora personal con el número de factura usando el channelId dinámico
        await client.channels.cache.get(channelId).send({
            content: `\n${personalizedInvoiceText}\n`,
            files: [{ attachment: screenshot.buffer, name: 'screenshot.png' }]
        });

        // Enviar a bitácora general
        await client.channels.cache.get(simpleTextChannelId).send({
            content: `\n${invoiceSimpleText}\n`
        });

        res.json({ message: 'Datos enviados a Discord exitosamente' });
    } catch (error) {
        console.error('Error sending to Discord:', error);
        res.status(500).json({ error: 'Failed to send to Discord' });
    }
});

app.post('/send-to-discord-repair', upload.single('screenshot'), async (req, res) => {
    try {
        const screenshot = req.file;
        const invoiceText = req.body.invoiceText;
        const invoiceSimpleText = req.body.invoiceSimpleText;
        const invoicePersonalText = req.body.invoicePersonalText;
        const channelId = req.body.channelId; // Obtener el channelId desde la solicitud

        // Incrementar el contador de facturas para el usuario
        const invoiceCount = await incrementInvoiceCount(channelId);

        // Personalizar el texto de la factura con el número total de facturas del usuario
        const personalizedInvoiceText = `${invoicePersonalText}\nTotal Facturas: ${invoiceCount}`;

        const simpleTextChannelId = '1258879535345172550'; // Canal general de reparación

        // Enviar a bitácora personal con el channelId dinámico
        await client.channels.cache.get(channelId).send({
            content: `\n${personalizedInvoiceText}\n`,
            files: [{ attachment: screenshot.buffer, name: 'screenshot.png' }]
        });

        // Enviar a bitácora general
        await client.channels.cache.get(simpleTextChannelId).send({
            content: `\n${invoiceSimpleText}\n`
        });

        res.json({ message: 'Datos enviados a Discord exitosamente' });
    } catch (error) {
        console.error('Error sending to Discord:', error);
        res.status(500).json({ error: 'Failed to send to Discord' });
    }
});

app.post('/send-to-discord-stancer', upload.array('screenshots', 2), async (req, res) => {
    try {
        const screenshots = req.files;
        const invoiceText = req.body.invoiceText;
        const invoicePersonalText = req.body.invoicePersonalText;
        const channelId = req.body.channelId; // Obtener el channelId desde la solicitud

        // Incrementar el contador de facturas para el usuario
        const invoiceCount = await incrementInvoiceCount(channelId);

        // Personalizar el texto de la factura con el número total de facturas del usuario
        const personalizedInvoiceText = `${invoicePersonalText}\nTotal Facturas: ${invoiceCount}`;

        const generalLogChannelId = '1258879590814843021'; // Canal general Stancer

        const screenshotFiles = screenshots.map((screenshot, index) => ({
            attachment: screenshot.buffer,
            name: `screenshot${index + 1}.png`
        }));

        // Enviar a bitácora personal con el channelId dinámico
        await client.channels.cache.get(channelId).send({
            content: `\n${personalizedInvoiceText}\n`,
            files: screenshotFiles
        });

        // Enviar a bitácora general
        await client.channels.cache.get(generalLogChannelId).send({
            content: `\n${invoiceText}\n`,
            files: screenshotFiles
        });

        res.json({ message: 'Datos de Stancer enviados a Discord exitosamente' });
    } catch (error) {
        console.error('Error sending Stancer data to Discord:', error);
        res.status(500).json({ error: 'Failed to send Stancer data to Discord' });
    }
});

app.post('/send-to-discord-aereo', upload.single('screenshot'), async (req, res) => {
    try {
        const screenshot = req.file;
        const invoiceText = req.body.invoiceText;
        const invoicePersonalText = req.body.invoicePersonalText;
        const channelId = req.body.channelId; // Obtener el channelId desde la solicitud

        // Incrementar el contador de facturas para el usuario
        const invoiceCount = await incrementInvoiceCount(channelId);

        // Personalizar el texto de la factura con el número total de facturas del usuario
        const personalizedInvoiceText = `${invoicePersonalText}\nTotal Facturas: ${invoiceCount}`;

        const generalLogChannelId = '1258879629645713408'; // Canal general Aéreo

        // Enviar a bitácora personal con el channelId dinámico
        await client.channels.cache.get(channelId).send({
            content: `\n${personalizedInvoiceText}\n`,
            files: [{ attachment: screenshot.buffer, name: 'screenshot.png' }]
        });

        // Enviar a bitácora general
        await client.channels.cache.get(generalLogChannelId).send({
            content: `\n${invoiceText}\n`,
            files: [{ attachment: screenshot.buffer, name: 'screenshot.png' }]
        });

        res.json({ message: 'Datos de Aéreo enviados a Discord exitosamente' });
    } catch (error) {
        console.error('Error sending Aéreo data to Discord:', error);
        res.status(500).json({ error: 'Failed to send Aéreo data to Discord' });
    }
});

app.post('/send-to-discord-acuatica', upload.single('screenshot'), async (req, res) => {
    try {
        const screenshot = req.file;
        const invoiceText = req.body.invoiceText;
        const invoicePersonalText = req.body.invoicePersonalText;
        const channelId = req.body.channelId; // Obtener el channelId desde la solicitud

        // Incrementar el contador de facturas para el usuario
        const invoiceCount = await incrementInvoiceCount(channelId);

        // Personalizar el texto de la factura con el número total de facturas del usuario
        const personalizedInvoiceText = `${invoicePersonalText}\nTotal Facturas: ${invoiceCount}`;

        const generalLogChannelId = '1258879693348671569'; // Canal general Acuático

        // Enviar a bitácora personal con el channelId dinámico
        await client.channels.cache.get(channelId).send({
            content: `\n${personalizedInvoiceText}\n`,
            files: [{ attachment: screenshot.buffer, name: 'screenshot.png' }]
        });

        // Enviar a bitácora general
        await client.channels.cache.get(generalLogChannelId).send({
            content: `\n${invoiceText}\n`,
            files: [{ attachment: screenshot.buffer, name: 'screenshot.png' }]
        });

        res.json({ message: 'Datos de Acuático enviados a Discord exitosamente' });
    } catch (error) {
        console.error('Error sending Acuático data to Discord:', error);
        res.status(500).json({ error: 'Failed to send Acuático data to Discord' });
    }
});

app.post('/send-to-discord-mejoras', upload.single('screenshot'), async (req, res) => {
    try {
        const screenshot = req.file;
        const invoiceText = req.body.invoiceText;
        const invoicePersonalText = req.body.invoicePersonalText;
        const channelId = req.body.channelId; // Obtener el channelId desde la solicitud

        // Incrementar el contador de facturas para el usuario
        const invoiceCount = await incrementInvoiceCount(channelId);

        // Personalizar el texto de la factura con el número total de facturas del usuario
        const personalizedInvoiceText = `${invoicePersonalText}\nTotal Facturas: ${invoiceCount}`;

        const generalLogChannelId = '1279403390882943057'; // Canal general Mejoras

        // Enviar a bitácora personal con el channelId dinámico
        await client.channels.cache.get(channelId).send({
            content: `\n${personalizedInvoiceText}\n`,
            files: [{ attachment: screenshot.buffer, name: 'screenshot.png' }]
        });

        // Enviar a bitácora general
        await client.channels.cache.get(generalLogChannelId).send({
            content: `\n${invoiceText}\n`,
            files: [{ attachment: screenshot.buffer, name: 'screenshot.png' }]
        });

        res.json({ message: 'Datos de Mejoras enviados a Discord exitosamente' });
    } catch (error) {
        console.error('Error sending Mejoras data to Discord:', error);
        res.status(500).json({ error: 'Failed to send Mejoras data to Discord' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

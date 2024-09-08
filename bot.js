const { Client, Intents } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const token = 'MTI1NjY2NDcwMzM1OTI1NDY0MA.GgV2bA.bE72PpM8pynLI8EVU02u9jMccnRKCP3XQ_-UAg';

client.login(token);

client.once('ready', () => {
    console.log('¡Bot está listo!');
});

const facturaChannelId = '1256671060833603584';
const noImageChannelId = '1256671037828108410';

function enviarFacturaConImagen(factura, imagenBase64) {
    const facturaChannel = client.channels.cache.get(facturaChannelId);
    if (facturaChannel) {
        facturaChannel.send({
            content: factura,
            files: [{ attachment: `data:image/png;base64,${imagenBase64}`, name: 'captura.png' }]
        });
    } else {
        console.error(`No se encontró el canal con ID ${facturaChannelId}`);
    }

    const noImageChannel = client.channels.cache.get(noImageChannelId);
    if (noImageChannel) {
        noImageChannel.send(factura);
    } else {
        console.error(`No se encontró el canal con ID ${noImageChannelId}`);
    }
}

module.exports = { enviarFacturaConImagen };

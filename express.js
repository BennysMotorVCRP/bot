const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const app = express();

const users = [
    { name: 'Adonis Galarce', channelId: '1148057357704757359' },
    { name: 'Nicolas Mairy', channelId: '1221636246640787536' },
    { name: 'Diego Riveros', channelId: '1200585926716444793' },
    { name: 'Sebastian Soto', channelId: '1221628793991729232' },
    { name: 'Gary Sapo', channelId: '1200586581812195328' },
    { name: 'Diego Suazo', channelId: '1276381068060135464' },
    { name: 'Fernando Agustin', channelId: '1214022862319525960' },
    { name: 'Aspirote Mcgregor', channelId: '1221628567172153455' },
    { name: 'Mia Renaldi', channelId: '1241940874946936954' },
    { name: 'Cris Galarce', channelId: '1280575812369907732' },
    { name: 'Luna Gil', channelId: '1214073631206809700' },
    { name: 'Joao Mos', channelId: '1186029867603611719' },
    { name: 'Pitu Curicano', channelId: '1241940930496434257' },
    { name: 'Charlie Perez', channelId: '1239416566303424522' },
    { name: 'Gino Beltran', channelId: '1252089284891246664' },
    { name: 'Jack Parker', channelId: '1278918622756081786' },
    { name: 'Celeste Galarce', channelId: '1221628538998882404' },
    { name: 'Manuel Gutierrez', channelId: '1258462934892417055' },
    { name: 'Maurizio Salvatore', channelId: '1241940785918775348' },
    { name: 'Darya Ayala', channelId: '1259330959061553212' },
    { name: 'Maria Guerra', channelId: '1280361886847602779' },
    { name: 'Benjamin Gonzales', channelId: '1269529707787980850' },
    { name: 'Castiel Winchester', channelId: '1259331629135171597' },
    { name: 'Chris Shelby', channelId: '1268286495488475207' },
    { name: 'Gabriella Salvatore', channelId: '1277042239217860820' },
    { name: 'DVNNI JR', channelId: '1259341043598495824' },
    { name: 'Central Sii', channelId: '1267292168205111367' },
    { name: 'Ignacio Potito', channelId: '1267276979845992478' },
    { name: 'Scott Rogers', channelId: '1267975098535510069' },
    { name: 'Javiera Gaete', channelId: '1267275323943157831' },
    { name: 'Nikolas Bachmann', channelId: '1273071093581877278' },
    { name: 'Lily Brooks', channelId: '1272370843602649138' },
    { name: 'Piero Guzman', channelId: '1272356847290155139' },
];

// Generar hash de 16 caracteres
const generateHash = () => {
    return crypto.randomBytes(8).toString('hex'); // 8 bytes = 16 hex characters
};

// Procesar usuarios y añadir el hash
const processUsers = () => {
    return users.map(user => {
        return {
            name: user.name,
            channelId: user.channelId,
            key: generateHash(),
        };
    });
};

// Guardar los usuarios con hash en users.json
const saveUsersToFile = (users) => {
    const jsonData = JSON.stringify(users, null, 2);
    fs.writeFileSync('users.json', jsonData, 'utf8');
    console.log('Users saved to users.json');
};

// Ruta principal para ejecutar el guardado
app.get('/register-users', (req, res) => {
    const usersWithHash = processUsers();
    saveUsersToFile(usersWithHash);
    res.send('Users registered and saved to users.json');
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

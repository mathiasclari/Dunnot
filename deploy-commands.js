const { REST, Routes } = require('discord.js');
const { DISCORD_CLIENT_ID, DISCORD_BOT_TOKEN } = require('./config.js');
const fs = require('fs');
const path = require('path');

// Array to hold commands
const commands = [];

// Load commands from subdirectories
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
            console.log(`Added command: ${command.data.name}`);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing required "data" or "execute" property.`);
        }
    }
}

// Initialize REST client
const rest = new REST().setToken(DISCORD_BOT_TOKEN);

// Deploy commands
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // For global commands
        const data = await rest.put(
            Routes.applicationCommands(DISCORD_CLIENT_ID),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands globally.`);
        console.log('Global commands may take up to 1 hour to update across all servers.');
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
})();
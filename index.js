/**
 * Require file system module from node for command file parsing.
 */
const fs = require("node:fs");

/**
 * Require path module from node for constructing paths.
 */
const path = require("node:path");

/**
 * Require the necessary discord.js classes.
 */
const { Client, Collection, GatewayIntentBits } = require("discord.js");

/**
 * Init and load .env into process.env for config management.
 */
require("dotenv").config();

/**
 * The authentication token for the bot.
 */
const BOT_TOKEN = process.env.BOT_TOKEN; 

/**
 * Create a new Discord client instance
 */
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

/**
 * Collection of commands for existing slash commands. 
 */
client.commands = new Collection();

/**
 * The path to the command folders and their subdirectories.
 */
const foldersPath = path.join(__dirname, "commands");

/**
 * The command folders at the commands directory path. 
 */
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);

        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

/**
 * The path to the events used within this bot.
 */
const eventsPath = path.join(__dirname, "events");

/**
 * The event js files that are at the events path.
 */
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    
    const event = require(filePath);
    
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Log in to Discord with your client's token
client.login(BOT_TOKEN);

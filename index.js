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
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");

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
 * The path to the commands directory where slash commands will be loaded from.
 */
const commandsPath = path.join(__dirname, "commands");

/**
 * The command files that have been loaded from the commands directory. (Only includes .js files)
 */
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

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Listener for commands
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true });
        } else {
            await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
        }
    }
});

// Log in to Discord with your client's token
client.login(BOT_TOKEN);

/**
 * Require REST api and routes for registering slash commands.
 */
const { REST, Routes } = require("discord.js");

/**
 * Init and load .env into process.env for config management.
 */
require("dotenv").config();

/**
 * The authentication token for the bot.
 */
const BOT_TOKEN = process.env.BOT_TOKEN; 

/**
 * The client ID for the bot. (Application ID) 
 */
const CLIENT_ID = process.env.CLIENT_ID;

/**
 * The Guild ID for the test server. (Server ID)
 */
const GUILD_ID = process.env.GUILD_ID;

/**
 * Require file system module from node for command file parsing.
 */
const fs = require("node:fs");

/**
 * Require path module from node for constructing paths.
 */
const path = require("node:path");

const commands = [];

// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, "commands");

const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(foldersPath, folder);

    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);

        const command = require(filePath);
        if ("data" in command && "execute" in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(BOT_TOKEN);

// and deploy your commands!
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            // NOTE: When we want to deploy these globally, we want to change this route to aapplicationsCommands()
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();

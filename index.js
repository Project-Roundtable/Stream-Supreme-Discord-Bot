/**
 * Require the necessary discord.js classes.
 */
const { Client, Events, GatewayIntentBits } = require("discord.js");

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

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
client.login(BOT_TOKEN);

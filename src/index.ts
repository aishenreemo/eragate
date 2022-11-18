import discord from "discord.js";
import dotenv from "dotenv";

const intents = [discord.GatewayIntentBits.Guilds];
const client = new discord.Client({ intents });

function onReady() {
    console.log("Bot is up and running!");
}

function main() {
    dotenv.config();
    client.on("ready", onReady);
    client.login(process.env.ERAGATE_TOKEN);
}

main();

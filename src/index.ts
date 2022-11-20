import * as client from "./structs/client";

import discord from "discord.js";
import fs from "fs/promises";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const intents = [discord.GatewayIntentBits.Guilds];
const bot = new client.EragateClient(intents);
const rest = new discord.REST({ version: '10' }).setToken(process.env.ERAGATE_TOKEN);

function main() {
    bot.on(discord.Events.ClientReady, onReady);
    bot.on(discord.Events.InteractionCreate, onInteractionCreate);
    bot.login(process.env.ERAGATE_TOKEN);
}

async function onReady() {
    console.log("Bot is up and running!");
    console.log("Loading commands...");

    let body = [];
    let files = await readFiles("commands", []);

    for (let i = 0; i < files.length; i++) {
        let cmd = files[i];

        bot.commands.set(cmd.data.name, cmd.execute);
        body.push(cmd.data.toJSON());

        console.log(`- Loading "${cmd.data.name}" command...`);
    }

    await rest.put(discord.Routes.applicationCommands(bot.user.id), { body });
    console.log(`Successfully loaded application (/) commands.`);
}

async function onInteractionCreate(interaction: discord.Interaction) {
    if (!interaction.isChatInputCommand()) return;

    let cmdExecuteFn = bot.commands.get(interaction.commandName);
    if (cmdExecuteFn) cmdExecuteFn(bot, interaction);
}

async function readFiles(query: String, out: Array<any>): Promise<Array<any>> {
    let files = await fs.readdir(path.resolve(`./dist/${query}`));
    let resolveFile = (exportedFile: any) => {
        if (!exportedFile.data || !exportedFile.execute) return;
        out.push(exportedFile);
    };

    for (let i = 0; i < files.length; i++) {
        let file = files[i];

        if (file.indexOf('.') === -1) {
            out = await readFiles(`${query}/${file}`, out);
        } else if (file.endsWith(".js")) {
            await import(`./${query}/${file}`).then(resolveFile);
        }
    }

    return out;
}

main();

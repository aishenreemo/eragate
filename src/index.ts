import * as command from "./structs/command";
import * as client from "./structs/client";

import discord from "discord.js";
import fs from "fs/promises";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const intents = [discord.GatewayIntentBits.Guilds];
const bot = new client.EragateClient(intents, process.env.ERAGATE_TOKEN);

function main() {
    bot.on(discord.Events.InteractionCreate, onInteractionCreate);
    bot.on(discord.Events.ClientReady, onReady);
    bot._login();
}

async function onReady() {
    console.log("Bot is up and running!");
    console.log("Loading commands...");

    let files = await readFiles("commands", []);

    let commandBody = [];
    let commandFiles: command.EragateCommand[] = files.filter(f => !!f.execute && !!f.data);

    for (let i = 0; i < commandFiles.length; i++) {
        let cmd = commandFiles[i];

        bot.commands.set(cmd.data.name, cmd.execute);
        commandBody.push(cmd.data.toJSON());

        console.log(`- Loading "${cmd.data.name}" command...`);
    }

    await bot.rest.put(discord.Routes.applicationCommands(bot.user.id), { body: commandBody });
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

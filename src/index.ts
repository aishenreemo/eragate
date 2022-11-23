import * as command from "./structs/command";
import * as client from "./structs/client";
import * as mongodb from "mongodb";

import discord from "discord.js";
import fs from "fs/promises";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const intents = [discord.GatewayIntentBits.Guilds];
const bot = new client.EragateClient(intents);
const dbopts = { useNewUrlParser: true, useUnifiedTopology: true } as mongodb.MongoClientOptions;
const dbclient = new mongodb.MongoClient(bot.mongoURI, dbopts);

function main() {
    dbclient.connect().then(onDatabaseReady).catch(console.error);

    bot.on(discord.Events.InteractionCreate, onDiscordInteractionCreate);
    bot.on(discord.Events.ClientReady, onDiscordClientReady);
    bot._login();
}

function onDatabaseReady() {
    console.log("Database is up and running");
}

async function onDiscordClientReady() {
    console.log("Bot is up and running!");
    console.log("Loading commands...");

    await reloadCommands();
}

async function onDiscordInteractionCreate(interaction: discord.Interaction) {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.options.getSubcommand(false) == null) {
        let cmdExecuteFn = bot.commands.get(interaction.commandName);
        if (cmdExecuteFn) cmdExecuteFn(bot, interaction, dbclient);
    } else {
        let subCommandName = interaction.options.getSubcommand();
        let cmdExecuteFn = bot.commands.get(`${interaction.commandName}_${subCommandName}`);
        if (cmdExecuteFn) cmdExecuteFn(bot, interaction, dbclient);
    }
}

async function readFiles(query: String, out: Array<any>): Promise<Array<any>> {
    let files = await fs.readdir(path.resolve(`./dist/${query}`));
    let resolveFile = (exportedFile: any) => out.push(exportedFile);

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

async function reloadCommands() {
    let files = await readFiles("commands", []);

    let commandBody: discord.RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
    let commandFiles: command.EragateCommand[] = files.filter(f => !!f.data);

    let subCommands: command.EragateSubCommand[] = [];
    let parentCommands: command.EragateParentCommand[] = [];
    let normalCommands: command.EragateCommand[] = [];

    for (let i = 0; i < commandFiles.length; i++) {
        let cmd = commandFiles[i];
        let isNormal = true;

        if (!!cmd.parent && !!cmd.execute && !cmd.subcommands) {
            subCommands.push(cmd as unknown as command.EragateSubCommand);
            isNormal = false;
        }

        if (!!cmd.subcommands && !cmd.execute && !cmd.parent) {
            parentCommands.push(cmd as command.EragateParentCommand);
            isNormal = false;
        }

        if (isNormal) normalCommands.push(cmd);
    }

    for (let i = 0; i < parentCommands.length; i++) {
        let pcmd = parentCommands[i];

        console.log(`- Loading "${pcmd.data.name}" command...`);

        for (let j = 0; j < pcmd.subcommands.length; j++) {
            let subCommandName = pcmd.subcommands[j];

            for (let k = 0; k < subCommands.length; k++) {
                let subCommand = subCommands[k];
                let subCommandJSON = subCommand.data.toJSON();

                if (subCommandJSON.name != subCommandName) continue;

                console.log(`-- Loading "${subCommandJSON.name}" command...`);

                bot.commands.set(`${pcmd.data.name}_${subCommandJSON.name}`, subCommand.execute);
                pcmd.data.addSubcommand(() => subCommand.data);
                subCommands.splice(k, 1);
                break;
            }
        }

        console.log(pcmd.data.toJSON());
        commandBody.push(pcmd.data.toJSON());
    }

    for (let i = 0; i < normalCommands.length; i++) {
        let cmd = normalCommands[i];

        console.log(`- Loading "${cmd.data.name}" command...`);

        if (!cmd.execute) continue;

        bot.commands.set(cmd.data.name, cmd.execute);
        commandBody.push(cmd.data.toJSON());
        console.log(cmd.data.toJSON());
    }

    if (!bot.user) return;

    await bot.rest.put(discord.Routes.applicationCommands(bot.user.id), { body: commandBody });
    console.log(`Successfully loaded application (/) commands.`);
}

main();

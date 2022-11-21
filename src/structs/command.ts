import * as client from "./client";
import * as mongodb from "mongodb";
import discord from "discord.js";

export interface EragateCommand {
    data: discord.SlashCommandBuilder;
    execute: (
        bot: client.EragateClient,
        interaction: discord.Interaction,
        dbclient: mongodb.MongoClient
    ) => Promise<void>;
}

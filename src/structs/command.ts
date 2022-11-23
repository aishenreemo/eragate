import * as client from "./client";
import * as mongodb from "mongodb";
import discord from "discord.js";

export interface EragateCommand {
    data: discord.SlashCommandBuilder;
    execute?: (
        bot: client.EragateClient,
        interaction: discord.Interaction,
        dbclient: mongodb.MongoClient
    ) => Promise<void>;
    parent?: string;
    subcommands?: string[];
}

export interface EragateParentCommand {
    data: discord.SlashCommandBuilder;
    subcommands: string[];
}

export interface EragateSubCommand {
    data: discord.SlashCommandSubcommandBuilder;
    execute: (
        bot: client.EragateClient,
        interaction: discord.Interaction,
        dbclient: mongodb.MongoClient
    ) => Promise<void>;
    parent: string;
}

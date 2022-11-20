import * as client from "./client";
import discord from "discord.js";

export interface EragateCommand {
    data: discord.SlashCommandBuilder;
    execute: (bot: client.EragateClient, interaction: discord.Interaction) => Promise<void>;
}

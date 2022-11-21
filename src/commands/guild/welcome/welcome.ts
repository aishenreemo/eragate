import discord from "discord.js";

export const subcommands = ["set", "preview"];
export const data = new discord.SlashCommandBuilder()
    .setName("welcome")
    .setDescription("welcome message for this server");

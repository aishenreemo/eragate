import * as client from "../../../structs/client";
import * as mongodb from "mongodb";
import discord from "discord.js";

export const parent = "welcome";
export const data = new discord.SlashCommandBuilder()
    .setName("preview")
    .setDescription("preview welcome message set for this server");

export async function execute(
    _bot: client.EragateClient,
    interaction: discord.Interaction,
    _dbclient: mongodb.MongoClient
) {
    if (!interaction.isRepliable()) return;

    await interaction.reply({ content: "No embed set for this server." });
}

import * as client from "../../../structs/client";
import * as mongodb from "mongodb";
import discord from "discord.js";

export const parent = "welcome";
export const data = new discord.SlashCommandSubcommandBuilder()
    .setName("preview")
    .setDescription("preview welcome message set for this server");

export async function execute(
    _bot: client.EragateClient,
    interaction: discord.Interaction,
    dbclient: mongodb.MongoClient
) {
    if (!interaction.isRepliable()) return;
    if (!interaction.isChatInputCommand()) return;

    let guilds = dbclient.db("main").collection("guild");
    let guildData = await guilds.findOne({ id: interaction.guild.id });

    if (guildData == null) {
        await interaction.reply({ content: "No embed set for this server." });
        return;
    }

    await interaction.reply(guildData.welcome_message);
}

import * as client from "../../../structs/client";
import * as mongodb from "mongodb";
import discord from "discord.js";

export const parent = "welcome";
export const data = new discord.SlashCommandSubcommandBuilder()
    .setName("set")
    .setDescription("set welcome message for this server")
    .addStringOption(option => option
        .setName("content")
        .setDescription("content of the message")
    ).addStringOption(option => option
        .setName("embed_title")
        .setDescription("title of the message embed")
        .setMaxLength(100)
    ).addStringOption(option => option
        .setName("embed_description")
        .setDescription("description of the message embed")
        .setMaxLength(2000)
    );

export async function execute(
    bot: client.EragateClient,
    interaction: discord.Interaction,
    dbclient: mongodb.MongoClient
) {
    if (!interaction.isRepliable()) return;
    if (!interaction.isChatInputCommand()) return;

    let defaultMsg = {
        content: "",
        embeds: [{
            title: "A user joined!",
            description: "Hey ${user.mention} welcome to **${guild.name}**"
        }]
    };

    let guilds = dbclient.db("main").collection("guild");
    let guildData = await guilds.findOne({ id: interaction.guild.id });

    if (guildData == null) {
        let content = interaction.options.getString("content") ?? defaultMsg.content;
        let title = interaction.options.getString("embed_title") ?? defaultMsg.embeds[0].title;
        let description = interaction.options.getString("embed_description")
            ?? defaultMsg.embeds[0].description;

        let newData = {
            id: interaction.guild.id,
            welcome_message: {
                content,
                embeds: [{ title, description }]
            }
        };

        await interaction.reply({ content: "No embed set for this server. Making a new one..." });
        await guilds.insertOne(newData);
    } else {
        let content = interaction.options.getString("content") ??
            guildData.welcome_message.content;
        let title = interaction.options.getString("embed_title") ??
            guildData.welcome_message.embeds[0].title;
        let description = interaction.options.getString("embed_description") ??
            guildData.welcome_message.embeds[0].description;

        guildData.welcome_message = {
            content,
            embeds: [{ title, description }]
        };

        await guilds.updateOne(
            { id: interaction.guild.id },
            { $set: { welcome_message: guildData.welcome_message }}
        );

        let commandId = await bot.application.commands.fetch()
            .then(d => d.findKey(c => c.name == 'welcome'));
        await interaction.reply({ content: `Embed set. Check </welcome preview:${commandId}>` });
    }
}

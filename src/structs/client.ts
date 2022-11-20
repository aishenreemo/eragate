import discord from "discord.js";

export class EragateClient extends discord.Client {
    public commands: discord.Collection<String, Function>;
    public rest: discord.REST;
    public mongoURI: string;
    public token: string;

    public constructor(intents: Array<discord.GatewayIntentBits>) {
        super({ intents });

        this.token = process.env.ERAGATE_TOKEN;
        this.mongoURI = process.env.ERAGATE_MONGO;
        this.commands = new discord.Collection();
        this.rest = new discord.REST({ version: '10' }).setToken(this.token);
    }

    public _login() {
        super.login(this.token);
    }
}

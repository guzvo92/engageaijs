// src/sdk/sdktonbot.ts

import { Telegraf, Context } from 'telegraf';
import { SdkGPT } from '../controllers/sdkgptv2'; // Ensure that the SdkGPT class is correctly exported

export class SdkTonBot {
    private bot: Telegraf<Context>;
    private gptKey: string;
    private adminId: number;
    private gptController: SdkGPT;
    private warningErrorPrivate: string

    constructor(botToken: string, gptKey: string, adminId: number) {
        this.bot = new Telegraf(botToken);
        this.gptKey = gptKey;
        this.adminId = adminId;
        this.gptController = new SdkGPT(this.gptKey);
        this.warningErrorPrivate = "This command only works in private chats."; // Message to inform the user that a command is private

        this.setupHandlers(); // Set up all bot command and message handlers
        this.setupErrorHandler(); // Add a global error handler
    }


    
    
    

    private setupHandlers() {
        // Command /start
        this.bot.start(async (ctx: Context) => {
            const messageStart = 
        `Hello welcome to this awesome MVP
The private commands available are:
- /admin     >[ADMIN] gives a test of admin check command
- /getchatid > gives to u the chat id
- /me        > gives to u the user information
The public commands available are:
- hello      >[PUBLIC] says hello
            `;

            await ctx.reply(messageStart);
        });

        //[PRIVATE COMMANDS] ---------------------------------------------------------

        // Command /admin
        this.bot.command('admin', async (ctx: Context) => {
            const userId = ctx.from?.id;

            // Ensure that ctx.chat is defined and private
            if (!ctx.chat || ctx.chat.type !== 'private') {await ctx.reply(this.warningErrorPrivate); return}
            if (userId !== this.adminId) {await ctx.reply("You are not admin"); return }

            await ctx.reply(`Enter mode admin achieved id ${userId}`);
        })

        // Command /getchatid
        this.bot.command('getchatid', async (ctx: Context) => {
            // Ensure that ctx.chat is defined and private
            if (ctx.chat && ctx.chat.type === 'private') {
                const chatId = ctx.chat.id;
                await ctx.reply(`El ID de este chat es: ${chatId}`);
            } else {
                await ctx.reply(this.warningErrorPrivate); // Inform user the command is private
            }
        });

        // Command /me
        this.bot.command('me', async (ctx: Context) => {
            // Ensure that ctx.chat is defined and private
            if (ctx.chat && ctx.chat.type === 'private') {
                const user = ctx.from;
                const userId = user?.id;
                const username = user?.username || "Undefined"; // If the username is not set, display "No definido"
                const phone = "Unavailable"; // Telegram API does not provide the user's phone number
                await ctx.reply(`Your info is:\nID: ${userId}\nUsername: ${username}\nPhone: ${phone}`);
            } else {
                await ctx.reply(this.warningErrorPrivate); 
            }
        });

        // Handler for messages containing "hello"
        this.bot.hears(/hello/i, async (ctx: Context) => {
            await ctx.reply("hellofrend"); // Simple response to "hello"
        });

        // Handler for messages containing "gpt"
        this.bot.hears(/gpt/i, async (ctx: Context) => {
            const userId = ctx.from?.id;
            if (userId !== this.adminId) {await ctx.reply("You are not admin"); return }

            // Ensure that ctx.message exists and has the 'text' property
            if (!ctx.message || !('text' in ctx.message)) {
                await ctx.reply("This command only works with text messages.");
                return;
            }

            const messageText = ctx.message.text || "";
            const prompt = messageText.replace(/gpt/i, '').trim(); // Remove "gpt" from the user's message and trim spaces
            if (prompt.length === 0) {
                await ctx.reply("Please provide a prompt after 'gpt'."); 
                return;
            }

            await ctx.reply("Processing..."); // Inform the user that their prompt is being processed
            try {
                const response = await this.gptController.message(prompt); // Call GPT method with the user's prompt
                await ctx.reply(response); // Reply with the GPT-generated response
            } catch (error) {
                console.error("Error processing GPT:", error); // Log the error
                await ctx.reply("There was an error processing your request."); // Inform user of the error
            }
        });

        this.bot.on('message', async (ctx: Context) => {
            const message = ctx.message;
        
            if (!message) {
                console.error("No message found in the context.");
                return;
            }
        
            // Verificar si el mensaje tiene texto
            if ('text' in message) {
                const user = message.from?.username || "Unknown";
                const text = message.text;
        
                console.log(`[${user}]: ${text}`); // Imprime en consola
                await ctx.reply(`You said: ${text}`);
            } else {
                console.log("Non-text message received.");
                await ctx.reply("This bot only processes text messages.");
            }
        });
        
        
        
        
    }

    private setupErrorHandler() {
        this.bot.catch((err, ctx) => {
            console.error(`An error occurred for ${ctx.updateType}`, err); // Log the error and its context
            if (ctx && ctx.reply) {
                ctx.reply("An internal error occurred. Please try again later."); // Inform the user of a generic error
            }
        });
    }

    public run() {
        this.bot.launch().then(() => {
            console.log("Bot started successfully."); // Log that the bot has started
        });

        // Handle process exits to stop the bot cleanly
        process.once('SIGINT', () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    }
}

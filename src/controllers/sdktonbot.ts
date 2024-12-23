// src/sdk/sdktonbot.ts

import { Telegraf, Context } from 'telegraf';
import { SdkGPT } from '../controllers/sdkgptv2'; // Ensure that the SdkGPT class is correctly exported
import { makedir,fileExists,makefile_custom,readjson,readraw,appendLineToFile,parsetimestamp } from '../controllers/sdkmakers';

const messageStart =
`Hello welcome to this awesome MVP
The private commands available are:
- /admin     >[ADMIN] gives a test of admin check command
- /getchatid > gives to u the chat id
- /me        > gives to u the user information
The public commands available are:
- hello      >[PUBLIC] says hello
`;

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

        //sniffer 
        /*
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
                appendLineToFile("log.txt",`[${user}]: ${text}`); // Guarda en archivo

                let checkhourmsg = text.match(/\/hourmsg/i);

                //await ctx.reply(`You said: ${text}`);
            } else {
                //console.log("Non-text message received.");
                //await ctx.reply("This bot only processes text messages.");
            }
        });
        */

        /*structmsg
            Full Message Object: {
            "message_id": 35,
            "from": {
                "id": 167824567,
                "is_bot": false,
                "first_name": "Max",
                "username": "newcortex",
                "language_code": "es",
                "is_premium": true
            },
            "chat": {
                "id": -1002320133483,
                "title": "Group With Shared Bot Sol AI Hack",
                "type": "supergroup"
            },
            "date": 1734975224,
            "text": "que la estan pasando"
            }
        */

        //structsniffer
        this.bot.on('message', async (ctx: Context) => {
            // Interfaces para los distintos tipos de mensajes reenviados
            interface ForwardFrom {
                id: number;
                is_bot: boolean;
                username?: string;
                first_name?: string;
                last_name?: string;
            }
        
            interface ForwardOriginHiddenUser {
                type: "hidden_user";
                sender_user_name: string;
                date: number;
            }
        
            interface ForwardOriginUser {
                type: "user";
                sender_user: {
                    id: number;
                    is_bot: boolean;
                    username?: string;
                    first_name?: string;
                    last_name?: string;
                };
                date: number;
            }
        
            // Mensaje completo
            interface Message {
                forward_from?: ForwardFrom;
                forward_origin?: ForwardOriginHiddenUser | ForwardOriginUser;
                date: number;
                text?: string;
                from: {
                    id: number;
                    is_bot: boolean;
                    username?: string;
                };
                message_id: number;
            }
        
            const message = ctx.message as Message;
        
            if (!message) {
                console.error("No message found in the context.");
                return;
            }
        
            // Imprimir mensaje completo para depuración
            console.log("Full Message Object:", JSON.stringify(message, null, 2));
        
            // Extraer información básica
            const msgId = message.message_id;
            const userId = message.from.id;
            const isBot = message.from.is_bot;
            const username = message.from.username || "NoUsername";
            const dateTimestamp = message.date;
        
            // Filtrar mensajes de bots o usuarios sin nombre de usuario
            if (isBot || username === "NoUsername") {
                console.log("Filtered message from bot or user without username.");
                return;
            }
        
            // Manejar datos de reenvío
            let isForwarder = false;
            let forwardInfo: string | null = null;
            let typemsg = "user";
        
            if (message.forward_from) {
                isForwarder = true;
                forwardInfo = `${message.forward_from.username || "Unknown"} (${message.forward_from.id})`;
                typemsg = "fwdfrom";
            } else if (message.forward_origin) {
                isForwarder = true;
                if (message.forward_origin.type === "hidden_user") {
                    const origin = message.forward_origin as ForwardOriginHiddenUser;
                    forwardInfo = `${origin.sender_user_name}`;
                    typemsg = "fwdhidden";
                }
            }
        
            // Manejar texto del mensaje
            if (message.text) {
                let processedText = message.text.replace(/\n/g, " ");

                const text = message.text;
                const date = parsetimestamp(dateTimestamp);
        
                const registerStruct = isForwarder
                    ? `${dateTimestamp}__${msgId}__${isBot}__${isForwarder}__${typemsg}__${forwardInfo}__${processedText}`
                    : `${dateTimestamp}__${msgId}__${isBot}__${isForwarder}__${typemsg}__${username}__${processedText}`;

                makedir(`astorage/crudetel/${date.yearmonthday}`);
                await appendLineToFile(`astorage/crudetel/${date.yearmonthday}/h_${date.hour}.txt`, registerStruct);
        
                //console.log("Message logged:", registerStruct);
            } else {
                console.log("Non-text message received.");
            }
        })
            
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

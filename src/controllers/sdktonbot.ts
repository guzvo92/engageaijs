// src/sdk/sdktonbot.ts

import { Telegraf, Context } from 'telegraf';
import { SdkGPT } from '../controllers/sdkgptv2'; // Ensure that the SdkGPT class is correctly exported
import { makedir,fileExists,makefile_custom,readjson,readraw,appendLineToFile,parsetimestamp } from '../controllers/sdkmakers';
import { routineIA } from '../testgpt';
import { readif_wallet } from './tools';
import { SdkSolana } from './sdksolana';
import { PublicKey } from '@solana/web3.js'
import dotenv from 'dotenv';
dotenv.config();

const messageStart =
`Hello welcome to this awesome MVP
The private commands available are:
- /admin      [ADMIN] [gives a test of admin check command]
- /getchatid  [gives to u the chat id]
- /me         [gives to u the user information]
- /lookwallet [gives to u the wallet address]
\n
Private Interactive commands:
- /addwallet PasteWalletHERE [gives to u the wallet address]
(the command at Demo needs write /addwallet and paste the wallet address)
\n
The public commands available are:
- hello   [PUBLIC] [says hello]
`;

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

/*
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
}*/

interface Chat {
    id: number; // ID del chat (negativo para grupos)
    type: 'private' | 'group' | 'supergroup' | 'channel'; // Tipo de chat
    title?: string; // Nombre del grupo o canal (opcional)
    username?: string; // Nombre de usuario del chat (opcional, solo para canales o usuarios privados)
    first_name?: string; // Primer nombre (para usuarios privados)
    last_name?: string; // Apellido (para usuarios privados)
    // Otros campos opcionales que pueden estar presentes en un objeto Chat
}

interface Message {
    message_id: number; // ID único del mensaje
    from: {
        id: number; // ID del usuario que envió el mensaje
        is_bot: boolean; // Indica si el usuario que envió el mensaje es un bot
        username?: string; // Nombre de usuario del remitente
    };
    chat: Chat; // Información del chat donde se envió el mensaje
    date: number; // Timestamp del mensaje
    text?: string; // Texto del mensaje (opcional)
    forward_from?: ForwardFrom; // Información del mensaje reenviado (opcional)
    forward_origin?: ForwardOriginHiddenUser | ForwardOriginUser; // Información del origen del reenvío (opcional)
}

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

        //[ALL][Private] Command /me
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

        //[ALL][Private] Command /admin
        this.bot.command('admin', async (ctx: Context) => {
            const userId = ctx.from?.id;

            // Ensure that ctx.chat is defined and private
            if (!ctx.chat || ctx.chat.type !== 'private') {await ctx.reply(this.warningErrorPrivate); return}
            if (userId !== this.adminId) {await ctx.reply("You are not admin"); return }

            await ctx.reply(`Enter mode admin achieved id ${userId}`);
        })

        //[ALL][Private] Command /getchatid
        this.bot.command('getchatid', async (ctx: Context) => {
            // Ensure that ctx.chat is defined and private
            if (ctx.chat && ctx.chat.type === 'private') {
                const chatId = ctx.chat.id;
                await ctx.reply(`El ID de este chat es: ${chatId}`);
            } else {
                await ctx.reply(this.warningErrorPrivate); // Inform user the command is private
            }
        });
        
        //[ALL][Private] Command /addwallet
        this.bot.command('addwallet', async (ctx: Context) => {
            const userId = ctx.from?.id;
            const username = ctx.from?.username || "UnknownUser";

            // Verifica que sea un chat privado
            if (ctx.chat && ctx.chat.type === 'private') {
                makedir("astorage/wallets");

                // Extrae la wallet del mensaje del usuario (después de /addwallet)
                if (!ctx.message || !('text' in ctx.message)) {
                    await ctx.reply("This command only works with text messages.");
                    return;
                }
                const messageText = ctx.message?.text || "";
                const wallet = messageText.replace("/addwallet", "").trim();

                // Validar si se proporcionó una wallet
                if (!wallet) {
                    await ctx.reply("Please provide a wallet address after the command.");
                    return;
                }

                // Crear el archivo en el directorio con la información del usuario
                const walletFilePath = `astorage/wallets/${userId}.json`;
                const walletData = {
                    id: userId,
                    username: username,
                    wallet: wallet,
                    registered_at: new Date().toISOString(),
                };

                try {
                    await makefile_custom(walletData, walletFilePath);
                    await ctx.reply(`Wallet successfully registered: ${wallet}`);
                } catch (error) {
                    console.error("Error saving wallet file:", error);
                    await ctx.reply("There was an error registering your wallet. Please try again later.");
                }
            } else {
                await ctx.reply(this.warningErrorPrivate); // Inform user the command is private
            }
        });

        //[ALL][Private] Command /lookwallet
        this.bot.command('lookwallet', async (ctx: Context) => {
            const userId = ctx.from?.id;

            // Verifica que sea un chat privado
            if (ctx.chat && ctx.chat.type === 'private') {
                const walletFilePath = `astorage/wallets/${userId}.json`;
                const walletData = await readjson(walletFilePath, "Error reading wallet file");

                // Verificar si se encontró la wallet
                if (!walletData) {
                    await ctx.reply("No wallet found for this user.");
                    return;
                }
                const wallet = walletData.wallet;
                await ctx.reply(`Your wallet is: ${wallet}`);
            } else {
                await ctx.reply(this.warningErrorPrivate); // Inform user the command is private
            }
        });

        //[PUBLIC COMMANDS] ---------------------------------------------------------
        //[ADMIN][Private] command /sampleai
        this.bot.command('sampleai', async (ctx: Context) => {
            const userId = ctx.from?.id;
            //const wallet = walletData.wallet;
            //await ctx.reply(`Your wallet is: sample`);
            await ctx.reply("Scraping all messages and generatin AI analysis ...");
            if (userId !== this.adminId) {await ctx.reply("You are not admin"); return }
            //const chatId = message.chat.id;
            const idchat = ctx.chat?.id || 0;
            let resultAI = await routineIA(idchat);
            await ctx.reply("AI analysis completed");
            await ctx.reply(`[1] [IA scrap] ${resultAI.Totalmessages} messages`);
            await ctx.reply(`[2] [IA scrap] ${resultAI.responsegpt.Unique_users} unique users`);
            await ctx.reply(`[3] Users Top loading...`);
            for (const topc of resultAI.responsegpt.Top_contributors) {
                await ctx.reply(`[3] [IA scrap] ${topc.username} ${topc.messages}`);
            }

            for (const st of resultAI.responsegpt.Sentiments.positive) {
                await ctx.reply(`[6] [IA Positive Sentiments] \n ${st}`);
            }
            for (const st of resultAI.responsegpt.Sentiments.negative) {
                await ctx.reply(`[7] [IA Negative Sentiments] \n ${st}`);
            }
            await ctx.reply(`[8] [IA scrap determine a winner] ${resultAI.responsegpt.Winner.username} ${resultAI.responsegpt.Winner.reason}`);
            let ifwallet = await readif_wallet(resultAI.responsegpt.Winner.idtelegram);
            if (!ifwallet) {
                await ctx.reply("You need to register your wallet with /addwallet");
            }
            else {
                const PK = process.env.BOTKP;
                if (!PK) {throw new Error("PK no está definido en las variables de entorno.")}
                console.log("PK:",PK);
                const sdkSolana = new SdkSolana(PK.split(',').map(Number));
                console.log("\n--- Consultar Saldo ---");
                let balancetreasure = await sdkSolana.getBalance();
                await ctx.reply(`Balance treasure: ${balancetreasure}`);
                await ctx.reply("Your wallet is registered a part of the treasure would payed the transfer is incomming...");
                const walletwinner = await readjson(`astorage/wallets/${resultAI.responsegpt.Winner.idtelegram}.json`, `Error reading wallet file for ${resultAI.responsegpt.Winner.idtelegram}:`);
                const recipientPublicKey = new PublicKey(walletwinner.wallet);
                let resuttx = await sdkSolana.transferSOL(recipientPublicKey,0.5);
                await ctx.reply(`Transfer result ok: 0.5 Sols`);
                await ctx.reply(`Transfer result: ${resuttx}`);
                
            }
            
        });




        //[PUBLIC][ALL] Handler for messages containing "hello"
        this.bot.hears(/hello/i, async (ctx: Context) => {
            await ctx.reply("hellofrend"); // Simple response to "hello"
        });

        //[PUBLIC][ADMIN] Handler for messages containing "gpt"
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

        //structsniffer always running
        this.bot.on('message', async (ctx: Context) => {
        
            const message = ctx.message as Message;
        
            if (!message) {
                console.error("No message found in the context.");
                return;
            }
        
            // Imprimir mensaje completo para depuración
            //console.log("Full Message Object:", JSON.stringify(message, null, 2));
        
            // Extraer información básica
            const msgId = message.message_id;
            const userId = message.from.id;
            const isBot = message.from.is_bot;
            const username = message.from.username || "NoUsername";
            const dateTimestamp = message.date;

            const chatId = message.chat.id;
        
            // Filtrar mensajes de bots o usuarios sin nombre de usuario
            if (isBot || username === "NoUsername") {
                console.log("Filtered message from bot or user without username.");
                return;
            }
        
            // manipulate received message
            let isForwarder = false;
            let fwd_userName: string | null = null;
            let typemsg = "USER";
            let userIDfwd = null;
        
            if (message.forward_from) {
                isForwarder = true;
                fwd_userName = `${message.forward_from.username || "Unknown"}`;
                userIDfwd = message.forward_from.id;
                //typemsg = "fwdfrom";
                typemsg = "FWDF";
            } else if (message.forward_origin) {
                isForwarder = true;
                if (message.forward_origin.type === "hidden_user") {
                    //console.log("Hidden user found.");
                    //console.log(message)
                    userIDfwd = message.from.id;
                    const origin = message.forward_origin as ForwardOriginHiddenUser;
                    fwd_userName = `${origin.sender_user_name}`;
                    //typemsg = "fwdhidden";
                    typemsg = "FWDH";
                }
            }
        
            // Handle text
            if (message.text) {
                let processedText = message.text.replace(/\n/g, " ");

                const text = message.text;
                const date = parsetimestamp(dateTimestamp);
        
                const registerStruct = isForwarder
                    ? `${dateTimestamp}__${msgId}__B${isBot? 1 : 0}__F${isForwarder? 1 : 0}__${typemsg}__${userIDfwd}__${fwd_userName}__${processedText}`
                    : `${dateTimestamp}__${msgId}__B${isBot? 1 : 0}__F${isForwarder? 1 : 0}__${typemsg}__${userId}__${username}__${processedText}`;

                makedir(`astorage/${chatId}/crudetel/${date.yearmonthday}`);
                await appendLineToFile(`astorage/${chatId}/crudetel/${date.yearmonthday}/h_${date.hour}.txt`, registerStruct);
        
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

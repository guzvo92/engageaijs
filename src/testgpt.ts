// src/index.ts
import { makedir,fileExists,makefile_custom,readjson,readraw,readallfilesindir} from './controllers/sdkmakers';

import dotenv from 'dotenv';
import { SdkGPT } from './controllers/sdkgptv2';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

async function structSendprompt(message: string) {
    const GPT_KEY = process.env.GPTKEY;
    if (!GPT_KEY) {throw new Error("GPTKEY no está definido en las variables de entorno.");}
    const gpt = new SdkGPT(GPT_KEY);
    try {
        // Genera la respuesta utilizando el prompt
        const response = await gpt.message(message);
        console.log("Respuesta de GPT:", response);
    } catch (error) {
        console.error("Error al generar el prompt:", error);
    }
}

async function routineIA() {
    let readdirsatdb = await readallfilesindir("astorage/crudetel")
    console.log(readdirsatdb)
}




let promptbase=
`
I have this struct data of msgs that i will send u:
dateTimestamp__msgId__isBot__isForwarder__typemsg__username__processedText
what insights do you have for me, can u write to me a table with some good information?
take in mind that this is social telegram group from a crypto community
`;


async function main() {
    //await structSendprompt("Dime quien es Rambo");
    await routineIA();
}

main();

// src/index.ts
import { makedir,fileExists,cleanAndParseJSON,cleanGPTResponse,makefile_custom,readjson,readraw,readallfilesindir,makefile_customraw} from './controllers/sdkmakers';

import dotenv from 'dotenv';
import { SdkGPT } from './controllers/sdkgptv2';
import { mkdir } from 'fs';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

export async function structSendprompt(message: string): Promise<string | null> {
    const GPT_KEY = process.env.GPTKEY;
    if (!GPT_KEY) { throw new Error("GPTKEY no está definido en las variables de entorno."); }
    const gpt = new SdkGPT(GPT_KEY);
    try {
        // Genera la respuesta utilizando el prompt
        const response = await gpt.message(message);
        //console.log("Respuesta de GPT:", response);
        const cleanResponse = cleanGPTResponse(response);
        
        if (!cleanResponse) {
            console.error("Failed to parse GPT response as valid JSON.");
            return null;
        }

        const parsedResponse = cleanAndParseJSON(cleanResponse);
        if (!parsedResponse) {
            console.error("Failed to parse GPT response as valid JSON.");
            return null;
        }

        return parsedResponse;
    } catch (error) {
        console.error("Error al generar el prompt:", error);
        return ""; // Devuelve una cadena vacía en caso de error
    }
}


let promptbase=
`
I have this struct data of msgs that i will send u:
dateTimestamp__msgId__isBot__isForwarder__typemsg__username__processedText
what insights do you have for me, respondeme with a json struct with some good information?
take in mind that this is social telegram group from a crypto community, i need thath the json keys have
a structure like this:
- **Total messages**: The data shows analysis based on the messages sent.
- **Unique users**: Analysis of the active community members.
- **Top contributors**: Highlights the most active users in the group.
- **Message types**: Indicates how many messages are forwarded or user-generated.
- **Hashtags**: Identify the use and frequency of hashtags.
- **Links shared**: Reflects on the presence of links, primarily to a particular domain.
- **Common topics**: Extracts conversation themes from the messages.
- **Sentiments**: Highlights some evident positive and negative remarks that could influence group morale.
- **Recommendations**: Offers suggestions for improving community engagement and management. 
But important that i need only response the json struct, no more text, only the json in format .json.
`;

let newpromptbase = `
I will send you structured data in the format:
dateTimestamp__msgId__isBot__isForwarder__typemsg__username__processedText

You must analyze the data and return insights as a JSON object with the following structure:
{
    "Total_messages": <number>,
    "Unique_users": <number>,
    "Top_contributors": [
        {"idtelegram": <number>,"username": <string>, "messages": <number>},
        {"idtelegram": <number>,"username": <string>, "messages": <number>}
    ],
    "Users_activity": [
        {"idtelegram": <number>, "username": <string>, "messages": <number>},
        {"idtelegram": <number>, "username": <string>, "messages": <number>}
    ],
    "Message_types": {
        "forwarded": <number>,
        "user-generated": <number>
    },
    "Hashtags": {
        "<hashtag>": <number>
    },
    "Links_shared": {
        "total_shared": <number>,
        "unique_links": [<string>, <string>, ...]
    },
    "Common_topics": [<string>, <string>, <string>],
    "Sentiments": {
        "positive": [<string>, <string>, ...],
        "negative": [<string>, <string>, ...]
    },
    "Recommendations": [<string>, <string>, <string>],
    "Winner": {
        "username": <string>,
        "idtelegram": <number>,
        "reason": <string> // Example: "Most valuable contributions" or "Highest number of messages"
    }
}

For the field "Users_activity", group all messages by "idtelegram". Each object in the array should represent a unique user with the following keys:
- "idtelegram": the user's Telegram ID
- "username": the user's Telegram username
- "messages": the total number of messages they sent (sum all messages if they appear multiple times).
- Group all messages by "username" or "idtelegram".
- Count all messages, including "typemsg=user", "typemsg=fwdfrom", or other types.

Ensure that:
- The "Users_activity" array contains no duplicate "idtelegram".
- Messages are summed correctly for each user.
- The JSON is strictly valid and formatted correctly.
- Messages of type "user" are included in the count.
- Each user appears only once in the list, with their total message count.

Respond **only** with the JSON object. Do not include explanations, introductions, or other text. Strictly return valid JSON.
`;



export async function routineIA() {
    makedir("astorage/ia");
    let readdirsatdb = await readallfilesindir("astorage/crudetel");
    if (!readdirsatdb) { return; }
    for (const day of readdirsatdb) {
        makedir(`astorage/ia/${day}`);
        let readdayfiles = await readallfilesindir(`astorage/crudetel/${day}`);
        if (!readdayfiles) { return; }
        for (const file of readdayfiles) {
            let namefile = file.split(".")[0];
            let readcontent = await readraw(`astorage/crudetel/${day}/${file}`);
            if (!readcontent) { console.error(`No content: ${file}`);continue; }
            let lines = readcontent.split("\n");

            let responsePrompt = await structSendprompt(`${newpromptbase} \n ${readcontent}`);
            if (!responsePrompt) {console.error(`No GPT: ${file}`);continue;}
            
            let res={} as any
            res.when= day;
            res.whenrun = new Date().toISOString();
            res.hour= namefile;
            res.Winner = 
            res.Totalmessages=lines.length;
            res.responsegpt=responsePrompt;

            try {
                await makefile_custom(res, `astorage/ia/${day}/${namefile}.json`);
                return res;
            } catch (err) {
                console.error(`Error writing file for ${file}:`, err);
            }
        }
    }
    //console.log(readdirsatdb);
}








async function main() {
    //await structSendprompt("Dime quien es Rambo");
    console.log("Starting routine...");
    await routineIA();
    console.log("Routine finished.");
}

main();

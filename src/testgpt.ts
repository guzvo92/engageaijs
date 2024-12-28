// src/index.ts
import { makedir,fileExists,cleanAndParseJSON,cleanGPTResponse,makefile_custom,readjson,readraw,readallfilesindir,makefile_customraw} from './controllers/sdkmakers';

import dotenv from 'dotenv';
import { SdkGPT } from './controllers/sdkgptv2';
import { mkdir } from 'fs';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

export async function structSendprompt(message: string): Promise<string | null> {
    console.log("[PROMPT] Generating ...");
    const GPT_KEY = process.env.GPTKEY;
    if (!GPT_KEY) { throw new Error("GPTKEY no está definido en las variables de entorno."); }
    const gpt = new SdkGPT(GPT_KEY);
    try {
        // Genera la respuesta utilizando el prompt
        const response = await gpt.message(message);
        console.log("[PROMPT] Response Received ...");
        const cleanResponse = cleanGPTResponse(response);     
        if (!cleanResponse) {console.error("Failed to clean GPT response.");return null;}

        const parsedResponse = cleanAndParseJSON(cleanResponse);
        if (!parsedResponse) {console.error("Failed to parse GPT response");return null;}

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



export async function routineIA(idchat:number) {
    console.log("[ROUTINE][1] Starting routine for chat:", idchat);
    let basefolder = `astorage/groups/${idchat}`
    makedir(basefolder);
    makedir(`basefolder/ia`);
    let readedfilesdirchat = await readallfilesindir(`astorage/groups/${idchat}/crudetel`);
    if (!readedfilesdirchat) { return; }
    let ndays = readedfilesdirchat.length;
    console.log(`[ROUTINE][2] Days found in group ${idchat}: [${ndays}]`);
    
    let counterday = 1;
    for (const day of readedfilesdirchat) {
        console.log(`[ROUTINE][3] Day ${counterday}/${ndays}: ${day}`);
        counterday++;

        makedir(`astorage/groups/${idchat}/ia/${day}`);
        console.log(`[ROUTINE][4] creando file ... ${day}`);
        let readedHourFiles = await readallfilesindir(`astorage/groups/${idchat}/crudetel/${day}`);
        if (!readedHourFiles) { return; }
        //console.log(`Day: ${day}`);
        let nhourfiles = readedHourFiles.length;
        let counterhour = 1;

        let compoundPrompt = ""
        for (const filehour of readedHourFiles) {
            console.log(`[ROUTINE][4] Hour ${counterhour}/${nhourfiles}: ${filehour}`);
            nhourfiles++;

            let namefile = filehour.split(".")[0];
            let readcontent = await readraw(`astorage/groups/${idchat}/crudetel/${day}/${filehour}`);
            if (!readcontent) { console.error(`No content: ${filehour}`);continue; }
            let countlines = readcontent.split("\n");

            
            let responsePrompt = await structSendprompt(`${newpromptbase} \n ${readcontent}`);
            if (!responsePrompt) {console.error(`No GPT: ${filehour}`);continue;}
            
            let resmini={} as any
            resmini.when= day;
            resmini.whenrun = new Date().toISOString();
            resmini.hour= namefile;
            resmini.Totalmessages=countlines.length;
            resmini.responsegpt=responsePrompt;


            //make everyfile from every hour prompt
            console.log(`[ROUTINE][5] Creating file ... ${namefile}`);
            await makefile_custom(resmini,`astorage/groups/${idchat}/ia/${day}/${namefile}.json`);
            
            compoundPrompt += readcontent;
            return resmini
        }

        let resfile ={} as any
        resfile.ncountlines = compoundPrompt.split("\n").length;

        //EL COMPOUND LO ESTAMOS MANEJADO DIARIO
        await makefile_customraw(compoundPrompt, `astorage/groups/${idchat}/ia/${day}/compound.txt`);
        await makefile_custom(resfile, `astorage/groups/${idchat}/ia/${day}/compoundjson.json` );
        
    }
    
    

    //console.log(readdirsatdb);
}








async function main() {
    //await structSendprompt("Dime quien es Rambo");
    console.log("Starting routine...");
    await routineIA(-1002320133483);
    console.log("Routine finished.");
}

//main();

//npx ts-node src/testgpt.ts

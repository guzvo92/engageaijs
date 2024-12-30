// src/index.ts
import { makedir,readLinesFromFile_andmakelist,fileExists,cleanAndParseJSON,cleanGPTResponse,makefile_custom,readjson,readraw,readallfilesindir,makefile_customraw} from './controllers/sdkmakers';

import dotenv from 'dotenv';
import { SdkGPT } from './controllers/sdkgptv2';
import { mkdir } from 'fs';
import { prompt1 } from '../astorage/configs/prompt1';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

export async function structSendprompt(idprompt:string,message: string): Promise<string | null> {
    console.log(`[PROMPT][${idprompt}] Generating ...`);
    const GPT_KEY = process.env.GPTKEY;
    if (!GPT_KEY) { throw new Error("GPTKEY no está definido en las variables de entorno."); }
    const gpt = new SdkGPT(GPT_KEY);
    try {
        // Genera la respuesta utilizando el prompt
        const response = await gpt.message(message);
        console.log(`[PROMPT][${idprompt}] Response Received ...`);
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

function separateInBunches(array: any[], n: number) {
    let bunches: any[] = [];
    let tempbunch: any[] = [];
    let counter = 0;

    for (const item of array) {
        tempbunch.push(item);
        counter++;
        if (counter === n) {
            bunches.push(tempbunch);
            tempbunch = [];
            counter = 0;
        }
    }

    // Agregar cualquier grupo restante
    if (tempbunch.length > 0) {
        bunches.push(tempbunch);
    }

    return bunches;
}




export async function gpt_routineIA(idchat:number) {
    console.log("[ROUTINE][1] Starting routine for chat:", idchat);
    let basefolder = `astorage/groups/${idchat}`
    makedir(basefolder);
    makedir(`${basefolder}/ai`);
    let readedfilesdirchat = await readallfilesindir(`astorage/groups/${idchat}/crudetel`);
    if (!readedfilesdirchat) { return; }
    let ndays = readedfilesdirchat.length;
    console.log(`[ROUTINE][2] Days found in group ${idchat}: [${ndays}]`);
    
    let counterday = 1;
    for (const day of readedfilesdirchat) {
        console.log(`[ROUTINE][3] Day ${counterday}/${ndays}: ${day}`);
        counterday++;

        makedir(`astorage/groups/${idchat}/ai/${day}`);
        console.log(`[ROUTINE][4] creando file ... ${day}`);
        let readedHourFiles = await readallfilesindir(`astorage/groups/${idchat}/crudetel/${day}`);
        if (!readedHourFiles) { return; }
        //console.log(`Day: ${day}`);
        let nhourfiles = readedHourFiles.length;
        let counterhour = 1;

        let compoundPromptDay_byhours = [] as any
        let infostaticbyhour = [] as any
        let responsesbunches = [] as any

        for (const filehour of readedHourFiles) {
            console.log(`[ROUTINE][4] Hour ${counterhour}/${nhourfiles}: ${filehour}`);
            nhourfiles++;

            let namefile = filehour.split(".")[0];
            let readcontentbylines = await readLinesFromFile_andmakelist(`astorage/groups/${idchat}/crudetel/${day}/${filehour}`);
            if (!readcontentbylines) { console.error(`No content: ${filehour}`);continue; }
            let countlines = readcontentbylines.length;

            
            //let responsePrompt = await structSendprompt("5",`${prompt1} \n ${readcontentbylines}`);
            //if (!responsePrompt) {console.error(`No GPT: ${filehour}`);continue;}
            
            let resmini={} as any
            //resmini.when = new Date().toISOString();
            resmini.day= day;
            resmini.hour= namefile;
            resmini.Totalmessages_filehour=countlines
            infostaticbyhour.push(resmini);
            //resmini.responsegpt=responsePrompt;
            //make everyfile from every hour prompt
            //console.log(`[ROUTINE][6] Creating file ... ${namefile}`);
            //await makefile_custom(resmini,`astorage/groups/${idchat}/ia/${day}/${namefile}.json`);
            

            for (const line of readcontentbylines) {
                compoundPromptDay_byhours.push(line);
            }
            //return resmini
        }

        
        let bunchof500 = separateInBunches(compoundPromptDay_byhours, 500);
        let nbunches = bunchof500.length;
        
        for (let index = 0; index < bunchof500.length; index++) {
            const bunch = bunchof500[index];
            console.log(`[ROUTINE][7] Bunch ${index + 1}/${nbunches}`);
            let responsePrompt = await structSendprompt("5", `${prompt1} \n ${bunch}`);
            if (!responsePrompt) {console.error(`No GPT response for bunch ${index}`);continue;}
        
            let resfile = {} as any;
            resfile.day = day;
            resfile.bunch = index;
            resfile.responsegpt = responsePrompt;
        
            console.log(`[ROUTINE][8] Creating file ... ${day}_${index}`);
            await makefile_custom(resfile, `astorage/groups/${idchat}/ai/${day}/ia_bunch${index}.json`);
        
            // Agregar al array responsesbunches
            responsesbunches.push(resfile);
        }
        

        let resfinalfile ={} as any
        resfinalfile.day= day;
        resfinalfile.nbunches = nbunches;
        resfinalfile.infostaticbyhour=infostaticbyhour;
        resfinalfile.ncountlines = compoundPromptDay_byhours.length;
        resfinalfile.responsesbunches=responsesbunches;

        //EL COMPOUND LO ESTAMOS MANEJADO DIARIO
        //await makefile_custom(compoundPromptDay_byhours, `astorage/groups/${idchat}/ia/${day}/compoundDay.json`);
        await makefile_custom(resfinalfile, `astorage/groups/${idchat}/ai/${day}/final.json` );
        
    }
    
    

    //console.log(readdirsatdb);
}








async function main() {
    //await structSendprompt("Dime quien es Rambo");
    console.log("Starting routine...");
    await gpt_routineIA(-1002320133483);
    console.log("Routine finished.");
}

main();

//npx ts-node src/testgpt.ts

import { makedir,fileExists,cleanAndParseJSON,cleanGPTResponse,makefile_custom,readjson,readraw,readallfilesindir,makefile_customraw} from '../controllers/sdkmakers';


export async function readif_wallet(iduser: number): Promise<any | null> {
    try{
        let wallet = await readjson(`astorage/wallets/${iduser.toString()}.json`, `Error reading wallet file for ${iduser}:`);
        if (!wallet.wallet) { return false; }
        return true;
    }
    catch(err){
        console.error("Error reading wallet file:", err);
        return false;
    }
    
   
}

















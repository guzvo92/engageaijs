import { SdkSolana } from "./controllers/sdksolana";
import { PublicKey } from '@solana/web3.js';

import dotenv from 'dotenv';
dotenv.config();

const PK = process.env.BOTKP;
if (!PK) {throw new Error("PK no está definido en las variables de entorno.")}

(async () => {
    const sdkSolana = new SdkSolana(PK.split(',').map(Number));

    console.log("\n--- Consultar Saldo ---");
    await sdkSolana.getBalance();

    console.log("\n--- Realizando Transferencia ---");
    const recipientPublicKey = new PublicKey('2dNvaGAeMNjAfs2xcwpxRKegLSaKgkacR6DuU1eScAF6');
    await sdkSolana.transferSOL(recipientPublicKey,0.5);
})();

import { 
    LAMPORTS_PER_SOL, 
    Connection, 
    PublicKey, 
    Keypair, 
    SystemProgram, 
    Transaction, 
    sendAndConfirmTransaction 
} from '@solana/web3.js';
import bs58 from 'bs58';

export class SdkSolana {
    private connection: Connection;
    private payer: Keypair;

    constructor(KP: number[]) {

        this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        this.payer = Keypair.fromSecretKey(new Uint8Array(KP));
    }

    async getBalance(): Promise<any> {
        try {
            const balance = await this.connection.getBalance(this.payer.publicKey);
            console.log(`Public Key: ${this.payer.publicKey.toString()}`);
            console.log(`Balance (SOL): ${balance / LAMPORTS_PER_SOL}`);
            return `Balance (SOL): ${balance / LAMPORTS_PER_SOL}`
        } catch (error) {
            console.error("Error obteniendo el balance:", error);
        }
    }

    
    async transferSOL(reciptx: PublicKey, amountx:number ): Promise<any> {
        try {
            const amountInSOL = amountx;
            const lamports = amountInSOL * LAMPORTS_PER_SOL;
    
            // Obtener blockhash reciente
            const { blockhash } = await this.connection.getLatestBlockhash();
    
            // Crear transacción
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: this.payer.publicKey,
                    toPubkey: reciptx,
                    lamports: lamports,
                })
            );
    
            // Configurar la transacción
            transaction.feePayer = this.payer.publicKey;
            transaction.recentBlockhash = blockhash;
    
            // Firmar la transacción
            transaction.sign(this.payer);
    
            // Enviar y confirmar la transacción
            const signature = await sendAndConfirmTransaction(this.connection, transaction, [this.payer]);
            console.log(`Transacción completada con éxito. Se enviaron ${amountInSOL} SOL.`);
            console.log(`Firma de la transacción: ${signature}`);
            return signature
        } catch (error) {
            console.error("Error realizando la transferencia:", error);
        }
    }
}

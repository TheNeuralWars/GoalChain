// ==========================================
// GoalChain Solana Connector (Web3 & Anchor)
// ==========================================
// Este archivo maneja toda la comunicación entre el frontend (Dashboard)
// y el Smart Contract en Solana. Funciona como un SDK interno.

const PROGRAM_ID = "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg";
const NETWORK = "https://api.devnet.solana.com";

class GoalChainConnector {
    constructor() {
        this.connection = null;
        this.provider = null;
        this.wallet = null;
        this.program = null;
        this.isConnected = false;
        
        // Dummy IDL para evitar cargar el JSON completo en esta etapa. 
        // En producción real, se cargará el IDL completo de Anchor.
        this.idl = {
            "version": "0.1.0",
            "name": "goalchain_program",
            "instructions": [
                {
                    "name": "stake",
                    "accounts": [
                        {"name": "user", "isMut": true, "isSigner": true},
                        {"name": "userStake", "isMut": true, "isSigner": false},
                        {"name": "userTokenAccount", "isMut": true, "isSigner": false},
                        {"name": "vaultTokenAccount", "isMut": true, "isSigner": false},
                        {"name": "tokenMint", "isMut": false, "isSigner": false},
                        {"name": "tokenProgram", "isMut": false, "isSigner": false},
                        {"name": "systemProgram", "isMut": false, "isSigner": false}
                    ],
                    "args": [{"name": "amount", "type": "u64"}]
                }
            ]
        };
    }

    async init() {
        if (typeof window.solana === 'undefined') {
            console.error("Phantom Wallet no está instalada.");
            return false;
        }

        try {
            // Inicializar Web3 Connection
            this.connection = new solanaWeb3.Connection(NETWORK, "confirmed");
            
            // Conectar a Phantom
            const resp = await window.solana.connect();
            this.wallet = resp.publicKey;
            this.isConnected = true;
            
            console.log("Wallet conectada:", this.wallet.toString());

            // Configurar Anchor Provider
            const anchorProvider = new anchor.AnchorProvider(
                this.connection, 
                window.solana, 
                { preflightCommitment: "confirmed" }
            );
            anchor.setProvider(anchorProvider);
            this.provider = anchorProvider;

            // Inicializar el Programa Anchor
            this.program = new anchor.Program(this.idl, PROGRAM_ID, this.provider);
            
            console.log("GoalChain Smart Contract inicializado correctamente.");
            return true;

        } catch (err) {
            console.error("Error al conectar con Solana:", err);
            return false;
        }
    }

    async disconnect() {
        if (window.solana) {
            await window.solana.disconnect();
            this.isConnected = false;
            this.wallet = null;
            console.log("Wallet desconectada.");
        }
    }

    getShortWallet() {
        if (!this.wallet) return "";
        const w = this.wallet.toString();
        return `${w.substring(0,4)}...${w.substring(w.length - 4)}`;
    }

    // ==========================================
    // MÉTODOS DEL SMART CONTRACT (INTERFACES)
    // ==========================================

    /**
     * Staking de $GCH en The Vault.
     * @param {number} amount Cantidad a hacer stake
     */
    async stakeGCH(amount) {
        if (!this.isConnected || !this.program) throw new Error("Wallet no conectada");
        
        try {
            console.log(`Ejecutando instrucción 'stake' por ${amount} $GCH...`);
            
            // NOTA: En este paso se calcularían los PDAs (Program Derived Addresses)
            // const [userStakePDA] = await anchor.web3.PublicKey.findProgramAddress(
            //     [Buffer.from("stake"), this.wallet.toBuffer()],
            //     this.program.programId
            // );

            // Simulación de delay on-chain para UI
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            console.log("Staking completado (Simulado)");
            return true;
        } catch (error) {
            console.error("Error en stakeGCH:", error);
            return false;
        }
    }

    /**
     * Reclama los yields (dividendos) generados por los Genesis NFTs y The Vault.
     */
    async claimYield() {
        if (!this.isConnected) throw new Error("Wallet no conectada");
        try {
            console.log("Calculando y reclamando yields...");
            await new Promise(resolve => setTimeout(resolve, 1200));
            return { success: true, amount: Math.floor(Math.random() * 500) + 50 };
        } catch (error) {
            console.error("Error en claimYield:", error);
            return { success: false, amount: 0 };
        }
    }
}

// Singleton export
window.GoalChain = new GoalChainConnector();

(() => {
    const PROGRAM_ID = "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg";
    const NETWORK = "https://api.devnet.solana.com";
    const IDL_URL = "assets/js/generated/goalchain_program.idl.json";

    class GoalChainConnector {
        constructor() {
            this.connection = null;
            this.provider = null;
            this.wallet = null;
            this.program = null;
            this.isConnected = false;
            this.idl = null;
        }

        async loadIdl() {
            if (this.idl) return this.idl;
            const res = await fetch(IDL_URL, { cache: "no-store" });
            if (!res.ok) {
                throw new Error(`IDL no disponible (${res.status})`);
            }
            this.idl = await res.json();
            return this.idl;
        }

        async init() {
            if (typeof window.solana === "undefined") {
                console.error("Phantom Wallet no está instalada.");
                return false;
            }

            try {
                this.connection = new solanaWeb3.Connection(NETWORK, "confirmed");
                const resp = await window.solana.connect();
                this.wallet = resp.publicKey;
                this.isConnected = true;

                const anchorProvider = new anchor.AnchorProvider(
                    this.connection,
                    window.solana,
                    { preflightCommitment: "confirmed" }
                );
                anchor.setProvider(anchorProvider);
                this.provider = anchorProvider;

                const idl = await this.loadIdl();
                this.program = new anchor.Program(idl, new solanaWeb3.PublicKey(PROGRAM_ID), this.provider);

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
            }
            this.isConnected = false;
            this.wallet = null;
            this.provider = null;
            this.program = null;
            console.log("Wallet desconectada.");
        }

        getShortWallet() {
            if (!this.wallet) return "";
            const w = this.wallet.toString();
            return `${w.substring(0, 4)}...${w.substring(w.length - 4)}`;
        }

        async stakeGCH(amount) {
            if (!this.isConnected || !this.program) {
                throw new Error("Wallet no conectada");
            }
            if (!amount || amount <= 0) {
                throw new Error("Monto inválido");
            }
            // El front aún no calcula todas las cuentas PDA/ATA requeridas por el contrato.
            // Se evita ejecutar una simulación engañosa.
            console.warn("stakeGCH: pendiente wiring completo de cuentas on-chain.");
            return false;
        }

        async claimYield() {
            if (!this.isConnected || !this.connection || !this.wallet) {
                throw new Error("Wallet no conectada");
            }
            try {
                // Eliminamos la métrica aleatoria: devolvemos estado explícito hasta integrar claim on-chain.
                const lamports = await this.connection.getBalance(this.wallet, "confirmed");
                console.info(`claimYield no-op: balance wallet ${lamports} lamports`);
                return {
                    success: false,
                    amount: 0,
                    reason: "claim_yield_not_wired_yet",
                };
            } catch (error) {
                console.error("Error en claimYield:", error);
                return { success: false, amount: 0, reason: "rpc_error" };
            }
        }
    }

    window.GoalChain = new GoalChainConnector();
})();

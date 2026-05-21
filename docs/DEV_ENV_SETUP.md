# GoalChain — entorno de desarrollo (Rust / Solana / Anchor)

## Instalación en un comando

```bash
bash scripts/setup-dev-env.sh
```

Instala:

| Herramienta | Versión objetivo |
|-------------|------------------|
| Rust | 1.89.0 (`goalchain_program/rust-toolchain.toml`) |
| Solana CLI | stable (Anza) |
| Anchor CLI | 1.0.2 (AVM, alineado con `anchor-lang` 1.0.2) |
| Node.js | LTS vía nvm |
| npm deps | `goalchain_program/package.json` |

## PATH permanente (añadir a `~/.bashrc`)

```bash
export PATH="$HOME/.cargo/bin:$HOME/.local/share/solana/install/active_release/bin:$PATH"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
```

Abre una terminal nueva o ejecuta `source ~/.bashrc`.

## Verificar instalación

```bash
rustc --version    # 1.89.0
cargo --version
solana --version
anchor --version   # anchor-cli 1.0.2
node --version
npm --version
```

## Build y tests del programa

```bash
cd goalchain_program
export CARGO_TARGET_DIR="$(pwd)/target"   # artefactos en el repo, no en caché del sandbox
anchor build
anchor test --validator legacy             # solana-test-validator en :8899
```

`Anchor.toml` usa `cluster = "localnet"` para tests locales (no requiere devnet).

### Program ID / keypair

El ID on-chain documentado es `FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg`.  
Necesitas `target/deploy/goalchain_program-keypair.json` del equipo (ver `goalchain_program/.keys/README.md`).  
Sin él, `anchor build` falla con *Program ID mismatch*.

## Devnet (opcional)

```bash
solana config set --url devnet
solana airdrop 2
cd goalchain_program
# temporalmente: cluster = "devnet" en Anchor.toml
anchor deploy
```

Para release operativa en devnet (preflight, deploy, smoke tests y contingencia), usa:

- `docs/DEVNET_RELEASE_CHECKLIST.md`

## Troubleshooting

| Error | Solución |
|-------|----------|
| `anchor: command not found` | `source ~/.cargo/env && avm use 1.0.2` |
| `npm: command not found` | `source ~/.nvm/nvm.sh` |
| `Unable to read keypair` | `bash scripts/setup-dev-env.sh` (genera `~/.config/solana/id.json`) |
| Warning CLI vs `anchor-lang` | `anchor_version = "1.0.2"` ya está en `Anchor.toml` |
| `Failed to spawn surfpool` | `curl -sL https://run.surfpool.run/ \| bash` o `anchor test --validator legacy` |
| `Program ID mismatch` | Copiar keypair oficial o `anchor keys sync` (solo local) |
| Tests no conectan | Usar `--validator legacy` (tests apuntan a `127.0.0.1:8899`) |

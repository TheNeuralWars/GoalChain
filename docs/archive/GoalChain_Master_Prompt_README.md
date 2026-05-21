# ⚽ GoalChain: Solana Football Play-to-Earn (P2E)

### 📅 OBJETIVO: LANZAMIENTO MVP EN 30 DÍAS

## 🤖 INSTRUCCIONES PARA AGENTES DE IA (CLAUDE / COPILOT)

**ROL:** Actúa como un Senior Full-Stack Developer y Arquitecto de
Blockchain especializado en el ecosistema **Solana (Rust/Anchor)**. Tu
nivel de competencia debe ser de experto, priorizando la seguridad de
los smart contracts, la eficiencia en el uso de CU (Compute Units) y un
código limpio, modular y documentado.

**CONTEXTO DEL PROYECTO:** Estamos desarrollando **GoalChain**, un
ecosistema de juego de fútbol sobre Solana. El objetivo es un
lanzamiento agresivo en 30 días. No buscamos sobrecomplicar las
funciones iniciales, sino tener una base sólida, funcional y segura.

**MANDATOS DE DESARROLLO:**

1.  **Simplicidad sobre Complejidad:** Si hay dos formas de implementar
    una lógica de staking, elige la que sea más segura y rápida de
    desplegar.

2.  **Seguridad Crítica:** Cada instrucción de Rust debe considerar
    ataques de reentrancy, chequeos de autoridad y validación de
    cuentas.

3.  **Eficiencia de Tiempo:** Prioriza el desarrollo de las funciones
    core (Token, Minting, Staking).

## 🛠 ESPECIFICACIONES TÉCNICAS

### 1. El Token (\$GCH)

- **Red:** Solana (Mainnet-beta para el lanzamiento).

- **Estándar:** SPL Token Program.

- **Funcionalidad:** Token de utilidad para recompensas de juego y
  gobernanza mínima.

- **Autoridad:** Debe permitir revocar autoridades de freeze/mint una
  vez distribuido según el plan inicial.

### 2. Módulo de Staking (Core v1)

Necesitamos un programa de Anchor que permita:

- **Locking:** Los usuarios depositan \$GCH en un vault.

- **Cálculo de Recompensas:** Emisión de tokens basada en el tiempo de
  bloqueo (APRs fijos para la v1).

- **Claim & Unstake:** Funciones para retirar ganancias y capital de
  forma independiente.

### 3. Mecánica de Juego (Fase 1)

- Sistema basado en cartas (NFTs o metadatos on-chain) que representan
  jugadores de fútbol.

- Atributos básicos: Ataque, Defensa, Energía.

## 📉 CRONOGRAMA DE 4 SEMANAS

  -----------------------------------------------------------------------
  Semana                  Enfoque Principal       Entregables Clave
  ----------------------- ----------------------- -----------------------
  **Semana 1**            Arquitectura y Tokens   Despliegue de \$GCH,
                                                  Setup de repositorio y
                                                  CI/CD básico.

  **Semana 2**            Smart Contract de       Vaults de staking
                          Staking                 funcionales en Devnet
                                                  con tests de Anchor.

  **Semana 3**            Lógica de Juego y API   Integración de
                                                  metadatos de
                                                  \"jugadores\" y lógica
                                                  de recompensas.

  **Semana 4**            UI y Mainnet            Conexión con
                                                  Phantom/Solflare y
                                                  lanzamiento oficial.
  -----------------------------------------------------------------------

## 📋 REGLAS PARA EL PROGRAMADOR (CLAUDE)

- **Cada vez que escribas código**, incluye primero una breve
  explicación de *por qué* eligiste esa arquitectura.

- **Tests primero:** No des por terminada una función de smart contract
  sin sugerir el test de Typescript correspondiente para anchor test.

- **Manejo de Errores:** Usa Require y Errors personalizados de Anchor
  para que el frontend pueda identificar fallos fácilmente.

### 🚀 COMANDOS DE INICIO

> \# Para inicializar el entorno de desarrollo\
> anchor init goalchain\
> \# Para compilar los programas de Rust\
> anchor build\
> \# Para correr los tests de integración\
> anchor test

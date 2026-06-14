#!/usr/bin/env node
/**
 * IDL Sync Script for GoalChain Program
 *
 * Runs `anchor build`, then copies the generated IDL JSON and TypeScript types
 * to the SDK package, and builds the SDK.
 *
 * Usage:
 *   npx ts-node scripts/sync-idl.ts           # Full sync + build
 *   npx ts-node scripts/sync-idl.ts --check   # Verify sync only (CI)
 */

import { execSync } from "child_process";
import { existsSync, copyFileSync, mkdirSync, readFileSync } from "fs";
import { join, dirname } from "path";

const PROGRAM_DIR = join(__dirname, "..");
const ROOT_DIR = join(PROGRAM_DIR, "..");
const SDK_DIR = join(ROOT_DIR, "goalchain-sdk");
const SDK_SRC_DIR = join(SDK_DIR, "src");

const SOURCE_IDL = join(PROGRAM_DIR, "target", "idl", "goalchain_program.json");
const SOURCE_TYPES = join(PROGRAM_DIR, "target", "types", "goalchain_program.ts");

// Fallback sources (existing SDK files)
const FALLBACK_IDL = join(SDK_SRC_DIR, "goalchain_program.json");
const FALLBACK_TYPES = join(SDK_SRC_DIR, "goalchain_program.ts");

const TARGET_IDL = join(SDK_SRC_DIR, "goalchain_program.json");
const TARGET_TYPES = join(SDK_SRC_DIR, "goalchain_program.ts");

const PROGRAM_ID = "FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg";

interface SyncOptions {
  checkOnly: boolean;
  skipBuild: boolean;
  skipAnchorBuild: boolean;
}

function logStep(message: string): void {
  console.log(`\n[${new Date().toISOString()}] ${message}`);
}

function logSuccess(message: string): void {
  console.log(`  ✅ ${message}`);
}

function logError(message: string): void {
  console.error(`  ❌ ${message}`);
}

function runCommand(command: string, cwd: string = PROGRAM_DIR): void {
  try {
    execSync(command, { cwd, stdio: "inherit", encoding: "utf8" });
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error}`);
  }
}

function getSourcePaths(): { idl: string; types: string } {
  if (existsSync(SOURCE_IDL) && existsSync(SOURCE_TYPES)) {
    return { idl: SOURCE_IDL, types: SOURCE_TYPES };
  }
  if (existsSync(FALLBACK_IDL) && existsSync(FALLBACK_TYPES)) {
    logStep("Using fallback sources from SDK (program not built yet)");
    return { idl: FALLBACK_IDL, types: FALLBACK_TYPES };
  }
  throw new Error(
    "No IDL/types found in program target or SDK src. Run 'anchor build' in goalchain_program first."
  );
}

function verifyProgramId(idlPath: string): void {
  if (!existsSync(idlPath)) {
    throw new Error(`IDL not found at ${idlPath}`);
  }
  const idl = JSON.parse(readFileSync(idlPath, "utf8"));
  if (idl.address !== PROGRAM_ID) {
    throw new Error(
      `Program ID mismatch! Expected ${PROGRAM_ID}, found ${idl.address}`
    );
  }
  logSuccess(`Program ID verified: ${PROGRAM_ID}`);
}

function syncFiles(sourceIdl: string, sourceTypes: string): void {
  // Ensure target directory exists
  mkdirSync(SDK_SRC_DIR, { recursive: true });

  // Copy IDL JSON
  copyFileSync(sourceIdl, TARGET_IDL);
  logSuccess(`Copied IDL -> ${TARGET_IDL}`);

  // Copy TypeScript types
  copyFileSync(sourceTypes, TARGET_TYPES);
  logSuccess(`Copied types -> ${TARGET_TYPES}`);
}

function checkSync(sourceIdl: string, sourceTypes: string): void {
  if (!existsSync(TARGET_IDL)) {
    throw new Error(`Target IDL missing: ${TARGET_IDL}`);
  }
  if (!existsSync(TARGET_TYPES)) {
    throw new Error(`Target types missing: ${TARGET_TYPES}`);
  }

  // Compare IDL
  const idlContent = readFileSync(sourceIdl, "utf8");
  const targetIdl = readFileSync(TARGET_IDL, "utf8");
  if (idlContent !== targetIdl) {
    throw new Error(`IDL out of sync: ${TARGET_IDL}`);
  }

  // Compare types
  const typesContent = readFileSync(sourceTypes, "utf8");
  const targetTypes = readFileSync(TARGET_TYPES, "utf8");
  if (typesContent !== targetTypes) {
    throw new Error(`Types out of sync: ${TARGET_TYPES}`);
  }

  verifyProgramId(sourceIdl);
  logSuccess("IDL sync check OK.");
}

function buildSdk(): void {
  logStep("Building SDK...");
  runCommand("npm run build", SDK_DIR);
  logSuccess("SDK build completed.");
}

function main(): void {
  const args = process.argv.slice(2);
  const options: SyncOptions = {
    checkOnly: args.includes("--check"),
    skipBuild: args.includes("--skip-build"),
    skipAnchorBuild: args.includes("--skip-anchor-build"),
  };

  try {
    logStep("Starting IDL sync for GoalChain Program");

    if (options.checkOnly) {
      logStep("Running in check-only mode (CI verification)");
      const { idl: sourceIdl, types: sourceTypes } = getSourcePaths();
      checkSync(sourceIdl, sourceTypes);
      return;
    }

    // Step 1: Build the program (generates IDL + types) - skip if requested or if already exists
    if (!options.skipAnchorBuild) {
      logStep("Building Anchor program (generating IDL + types)...");
      try {
        runCommand("anchor build --ignore-keys");
        logSuccess("Anchor build completed.");
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes("anchor: not found") || msg.includes("ENOENT")) {
          logStep("Anchor CLI not found, checking for existing IDL/types...");
          if (!existsSync(SOURCE_IDL) || !existsSync(SOURCE_TYPES)) {
            throw new Error(
              "Anchor CLI not available and no existing IDL/types found. " +
              "Install anchor or run with --skip-anchor-build if files exist."
            );
          }
          logStep("Using existing IDL and types from target directory.");
        } else {
          throw error;
        }
      }
    } else {
      logStep("Skipping Anchor build (--skip-anchor-build flag)");
    }

    // Step 2: Get source paths (from target or fallback)
    const { idl: sourceIdl, types: sourceTypes } = getSourcePaths();

    // Step 3: Verify program ID
    verifyProgramId(sourceIdl);

    // Step 4: Copy files to SDK
    logStep("Syncing IDL and types to SDK...");
    syncFiles(sourceIdl, sourceTypes);

    // Step 5: Build SDK
    if (!options.skipBuild) {
      buildSdk();
    } else {
      logStep("Skipping SDK build (--skip-build flag)");
    }

    logStep("IDL sync completed successfully! 🎉");
  } catch (error) {
    logError(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
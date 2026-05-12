declare module '@solana-mobile/wallet-adapter-mobile' {
  // Minimal typing shim for TS until the package exports types correctly.
  // This avoids blocking the build.
  export class MobileWalletAdapter {
    constructor(config?: any);
  }
}

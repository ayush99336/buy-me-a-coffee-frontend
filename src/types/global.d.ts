export {};

declare global {
    interface Window {
        ethereum?: any; // Or use a more specific type if you know it (e.g., MetaMaskInpageProvider)
    }
}

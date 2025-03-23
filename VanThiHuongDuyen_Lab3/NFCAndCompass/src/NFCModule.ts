export interface NFCModule {
  startNFCScanning(): void;
  stopNFCScanning(): void;
}

export interface NFCData {
  tagId: string;
  technologies: string;
}

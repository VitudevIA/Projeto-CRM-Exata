/// <reference types="react-dom/client" />

declare module "react-dom/client" {
  import * as React from "react";
  
  export function createRoot(
    container: Element | DocumentFragment,
    options?: {
      identifierPrefix?: string;
      onRecoverableError?: (error: unknown) => void;
    }
  ): Root;
  
  export interface Root {
    render(children: React.ReactNode): void;
    unmount(): void;
  }
}


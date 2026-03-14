/// <reference types="astro/client" />

interface TurnstileInstance {
  render(
    element: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
    },
  ): string;
  reset(widgetId?: string): void;
  remove(widgetId?: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileInstance;
    onTurnstileLoad?: () => void;
  }
}

declare namespace App {
  interface Locals {
    session?: {
      user?: {
        id: string;
        name: string;
        email: string;
        role: string;
        image?: string;
      };
    };
  }
}

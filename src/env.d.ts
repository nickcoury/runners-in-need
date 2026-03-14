/// <reference types="astro/client" />

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

import { Quote } from "../types";

const comingSoon = (label: string) => `${label} — coming soon`;

export const integrationPlaceholders = {
  sendQuoteEmail: async (_quote: Quote) => comingSoon("Send quote email via Gmail"),
  sendWhatsAppReminder: async (_quote: Quote) => comingSoon("Send WhatsApp reminder"),
  bookProductionSlot: async (_quote: Quote) => comingSoon("Book production in Google Calendar"),
  uploadArtworkProof: async (_quote: Quote) => comingSoon("Upload artwork to Google Drive"),
  trackDepositPayment: async (_quote: Quote) => comingSoon("Track deposit via Stripe/PayFast/EFT"),
  createDevTask: async (_title: string) => comingSoon("Create GitHub Issue/Codex task")
};

export type IntegrationKey = keyof typeof integrationPlaceholders;

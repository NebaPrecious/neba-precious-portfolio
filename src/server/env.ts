import "server-only";

/**
 * Server-side configuration. Optional services degrade gracefully and the
 * admin dashboard reports what is not configured. Nothing here is ever sent
 * to the browser.
 */

const isProd = process.env.NODE_ENV === "production";

export function getAppSecret(): string {
  const secret = process.env.APP_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (isProd) {
    throw new Error("APP_SECRET must be set (32+ random characters) in production.");
  }
  // Development fallback only — never used in production builds.
  return "dev-only-insecure-secret-change-me-0123456789";
}

export type CloudinaryConfig = { cloudName: string; apiKey: string; apiSecret: string; folder: string };

export function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret, folder: process.env.CLOUDINARY_FOLDER || "portfolio" };
}

export type MailConfig = { apiKey: string; to: string; from: string };

export function getMailConfig(): MailConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) return null;
  return {
    apiKey,
    to,
    from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
  };
}

/** Local file uploads are allowed only outside production (no persistent disk on serverless). */
export function localUploadsAllowed() {
  return !isProd && process.env.ALLOW_LOCAL_UPLOADS !== "false";
}

export function getServiceStatus() {
  return {
    database: Boolean(process.env.DATABASE_URL),
    media: getCloudinaryConfig() ? "cloudinary" : localUploadsAllowed() ? "local-dev" : "none",
    email: Boolean(getMailConfig()),
    appSecret: Boolean(process.env.APP_SECRET && process.env.APP_SECRET.length >= 32),
  } as const;
}

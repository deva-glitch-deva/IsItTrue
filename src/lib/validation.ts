import { z } from "zod";

export const languageSchema = z.enum(["en", "hinglish"]);

export const verifySchema = z
  .object({
    mode: z.enum(["text", "reel", "media"]),
    language: languageSchema,
    claim: z.string().trim().max(1800).optional(),
    reelUrl: z.string().trim().max(500).optional(),
    caption: z.string().trim().max(1800).optional(),
    fileName: z.string().trim().max(200).optional(),
    mimeType: z.string().trim().max(120).optional(),
    transcriptHint: z.string().trim().max(300).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.mode === "text") {
      if (!value.claim || value.claim.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["claim"],
          message: "Claim must be at least 8 characters.",
        });
      }
    }
    if (value.mode === "reel") {
      if (!value.reelUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["reelUrl"],
          message: "Reel URL is required.",
        });
      } else {
        try {
          const url = new URL(value.reelUrl);
          if (
            !["instagram.com", "www.instagram.com"].includes(url.hostname) ||
            !/^\/(reel|reels|p|tv)\//.test(url.pathname)
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["reelUrl"],
              message: "Use an Instagram Reel, post or TV link.",
            });
          }
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["reelUrl"],
            message: "Invalid URL.",
          });
        }
      }
      if (!value.caption && value.caption !== "") {
        // Caption is explicitly optional. Nothing to do.
      }
    }
    if (value.mode === "media") {
      if (!value.fileName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fileName"],
          message: "A media file is required.",
        });
      }
    }
  });

export type VerifyInput = z.infer<typeof verifySchema>;

export const trendQuerySchema = z.object({
  lang: languageSchema.default("en"),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

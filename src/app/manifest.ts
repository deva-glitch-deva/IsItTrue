import type { MetadataRoute } from "next";

type ExtendedManifest = MetadataRoute.Manifest & {
  share_target?: {
    action: string;
    method: "GET" | "POST";
    enctype?: string;
    params: {
      title?: string;
      text?: string;
      url?: string;
    };
  };
};

export default function manifest(): ExtendedManifest {
  return {
    name: "Is It True? — Your pocket lie detector",
    short_name: "Is It True",
    description:
      "A neutral, AI-assisted fact checker for Instagram Reels and text claims.",
    id: "/",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#12100d",
    theme_color: "#12100d",
    categories: ["news", "education", "utilities"],
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    share_target: {
      action: "/verify",
      method: "GET",
      params: {
        title: "title",
        text: "text",
        url: "url",
      },
    },
  };
}

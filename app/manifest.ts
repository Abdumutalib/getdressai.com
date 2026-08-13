import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AKBEL CRM",
    short_name: "AKBEL",
    description: "Offline-first ERP/CRM for wholesale operations",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f4f1ea",
    theme_color: "#8b5e34",
    orientation: "portrait",
    lang: "uz-Cyrl-UZ",
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}

import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Secret Manager",
        short_name: "Secret Manager",
        description: "A secure app to manage credentials, vaults, and access.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        lang: "en",
        icons: [
            {
                src: "/apple-touch-icon.png",
                type: "image/svg+xml",
                sizes: "1024x1024",
                purpose: "maskable"
            },
            {
                src: "/web-app-manifest-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable"
            },
            {
                src: "/web-app-manifest-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable"
            }
        ]

    }
}
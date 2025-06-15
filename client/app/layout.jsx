import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const poppins = Poppins({
 weight: ['400', '600'],
 subsets: ['latin'],
 display: 'swap',
})

export const metadata = {
  title: "Secret Manager",
  description: "A secure app to manage credentials, vaults, and access.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={poppins.className}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import { Poppins } from "next/font/google";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}

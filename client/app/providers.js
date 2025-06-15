"use client";
import {
  FpjsProvider,
  FingerprintJSPro,
} from "@fingerprintjs/fingerprintjs-pro-react";

export function Providers({ children }) {
  return (
    <FpjsProvider
      loadOptions={{
        apiKey: "6IOD1tc33P5YAIDXmixU",
        region: "eu",
      }}
    >
      {children}
    </FpjsProvider>
  );
}

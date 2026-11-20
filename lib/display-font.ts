import localFont from "next/font/local"

export const display = localFont({
  src: [
    { path: "../fonts/newsreader-latin.woff2", weight: "400 500", style: "normal" },
    { path: "../fonts/newsreader-latin-italic.woff2", weight: "400 500", style: "italic" },
  ],
  display: "swap",
})

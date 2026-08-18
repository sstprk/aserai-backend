#!/usr/bin/env node
/**
 * Make Turkish the Medusa dashboard's default language.
 *
 * The dashboard picks its language as: `lng` cookie → localStorage →
 * Accept-Language → `fallbackLng`, and exposes no server-side setting for the
 * default. Two edits to the shipped bundle change that:
 *
 * 1. `fallbackLng` → ["tr", "en"] — Turkish becomes the default, and any key
 *    missing from the Turkish translation still falls back to English rather
 *    than rendering a raw key like "taxRegions.edit.header".
 * 2. Drop "header" from the detection order — otherwise the browser's
 *    Accept-Language wins and an English-locale browser never reaches the
 *    fallback.
 *
 * Cookie and localStorage still come first, so every language stays available
 * in Ayarlar → Profil → Düzenle → Dil and a choice made there always wins.
 *
 * This patches node_modules, which `npm install` wipes — hence the
 * `postinstall` hook in package.json. Safe to run repeatedly.
 *
 * Note: Vite pre-bundles the dashboard into node_modules/.vite, so that cache
 * is dropped whenever a patch is applied; the dev server rebuilds it on boot.
 */
import { readFileSync, writeFileSync, existsSync, rmSync, readdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const dashboard = join(root, "node_modules/@medusajs/dashboard")

if (!existsSync(dashboard)) {
  console.log("[i18n] @medusajs/dashboard not installed — skipping")
  process.exit(0)
}

const REPLACEMENTS = [
  ['fallbackLng: "en"', 'fallbackLng: ["tr", "en"]'],
  ['fallbackLng:"en"', 'fallbackLng:["tr","en"]'],
  [
    'order: ["cookie", "localStorage", "header"]',
    'order: ["cookie", "localStorage"]',
  ],
  ['order:["cookie","localStorage","header"]', 'order:["cookie","localStorage"]'],
  // The picker sorts alphabetically, which buries "Türkçe" far down a
  // scrollable list. Pin it to the top; everything else stays alphabetical.
  [
    "(a, b) => a.display_name.localeCompare(b.display_name)",
    '(a, b) => a.code === "tr" ? -1 : b.code === "tr" ? 1 : a.display_name.localeCompare(b.display_name)',
  ],
  [
    "(a,b)=>a.display_name.localeCompare(b.display_name)",
    '(a,b)=>a.code==="tr"?-1:b.code==="tr"?1:a.display_name.localeCompare(b.display_name)',
  ],
]

let patched = 0
const distDir = join(dashboard, "dist")
for (const file of readdirSync(distDir)) {
  if (!/\.(mjs|js)$/.test(file)) continue
  const path = join(distDir, file)
  const code = readFileSync(path, "utf8")
  if (!REPLACEMENTS.some(([from]) => code.includes(from))) continue

  let next = code
  for (const [from, to] of REPLACEMENTS) {
    next = next.replaceAll(from, to)
  }
  writeFileSync(path, next, "utf8")
  patched++
}

const viteCache = join(root, "node_modules/.vite")
let cleared = false
if (patched > 0 && existsSync(viteCache)) {
  rmSync(viteCache, { recursive: true, force: true })
  cleared = true
}

console.log(
  `[i18n] Turkish default applied to ${patched} bundle file(s)` +
    (cleared ? "; vite cache cleared" : "")
)

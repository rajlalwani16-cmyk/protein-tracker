// Run: node scripts/generate-icons.js
// Generates icons/icon-192.png and icons/icon-512.png using Canvas API (browser-side)
// Open generate-icons.html in Chrome, click the button, save both files to public/icons/

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'icons')

// Minimal valid PNG: solid green rounded-square placeholder
// For production, open generate-icons.html in Chrome to get proper icons

const SVG_TEMPLATE = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" fill="none">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="#1A4731"/>
  <circle cx="${size/2}" cy="${size/2}" r="${Math.round(size * 0.328)}" fill="#2D7A4F"/>
  <circle cx="${size/2}" cy="${size/2}" r="${Math.round(size * 0.234)}" fill="#1A4731"/>
  <text x="${size/2}" y="${Math.round(size * 0.582)}" font-family="Georgia,serif" font-size="${Math.round(size * 0.293)}" fill="#C0E8CC" text-anchor="middle" font-weight="bold">P</text>
  <circle cx="${Math.round(size*0.664)}" cy="${Math.round(size*0.352)}" r="${Math.round(size*0.043)}" fill="#5DB07A"/>
</svg>`

// Write SVGs as placeholder (rename extension for testing)
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

fs.writeFileSync(path.join(outDir, 'icon-192.svg'), SVG_TEMPLATE(192))
fs.writeFileSync(path.join(outDir, 'icon-512.svg'), SVG_TEMPLATE(512))

console.log('SVG icons written. Open scripts/generate-icons.html in Chrome to generate PNG versions.')
console.log('Place the downloaded PNGs at public/icons/icon-192.png and public/icons/icon-512.png')

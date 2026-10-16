import { copyFileSync } from 'node:fs'

copyFileSync('index.vite.html', 'index.html')
console.log('Restored Vite index.html for local/dev build')

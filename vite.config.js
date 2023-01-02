import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                fourOhFour: resolve(__dirname, '404.html'),
                potholderz: resolve(__dirname, 'potholderz/index.html'),
                chrimbas: resolve(__dirname, 'chrimbas/index.html'),
            }
        }
    }
})

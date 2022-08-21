import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                fourOhFour: resolve(__dirname, '404.html'),
                nested: resolve(__dirname, 'potholderz/index.html')
            }
        }
    }
})

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
	root: __dirname,
	plugins: [react(), tailwindcss()],
	resolve: { alias: { "@": path.resolve(__dirname, "src") } },
	server: {
		port: 5173,
		proxy: { "/api": { target: `http://127.0.0.1:${process.env.PORT || 3737}`, changeOrigin: true } },
	},
	build: { outDir: "dist", emptyOutDir: true },
});

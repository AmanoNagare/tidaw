import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss(), wasm(), topLevelAwait()],

	// SharedArrayBuffer が使えるようにするための設定。しかし、開発環境でのみ適用される。本番環境では別途設定が必要。
	server: {
		headers: {
			"Cross-Origin-Opener-Policy": "same-origin",
			"Cross-Origin-Embedder-Policy": "require-corp",
		},
	},
});

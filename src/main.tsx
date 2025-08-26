import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const isDemo = import.meta.env.VITE_DEMO === "true";

async function bootstrap() {
	const { default: Root } = isDemo
		? await import("./Demo.tsx") // `npm run dev:demo` を実行したら Demo.tsx が使われる
		: await import("./App.tsx");

	createRoot(document.getElementById("root")!).render(
		<StrictMode>
			<Root />
		</StrictMode>
	);
}

bootstrap();

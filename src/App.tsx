import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function App() {
	const [count, setCount] = useState(0);

	return (
		<main className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white flex flex-col items-center p-8">
			<div className="flex gap-6 justify-center items-center mt-6">
				<a
					href="https://vite.dev"
					target="_blank"
					rel="noreferrer"
					className="inline-block transform hover:scale-105 transition"
				>
					<img src={viteLogo} className="h-24 w-24" alt="Vite logo" />
				</a>
				<a
					href="https://react.dev"
					target="_blank"
					rel="noreferrer"
					className="inline-block transform hover:scale-105 transition"
				>
					<img src={reactLogo} className="h-24 w-24" alt="React logo" />
				</a>
			</div>

			<h1 className="text-4xl md:text-5xl font-extrabold text-center mt-8">
				Vite + React
			</h1>

			<section className="mt-8 bg-white/5 backdrop-blur-sm p-6 rounded-lg shadow-lg max-w-xl w-full text-center">
				<button
					onClick={() => setCount((c) => c + 1)}
					className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition text-white rounded-md font-medium"
				>
					count is {count}
				</button>

				<p className="mt-4 text-sm text-gray-300">
					Edit <code className="bg-gray-800 px-1 rounded">src/App.tsx</code> and
					save to test HMR
				</p>
			</section>

			<p className="text-center text-sm text-gray-400 mt-6">
				Click on the Vite and React logos to learn more
			</p>
		</main>
	);
}

export default App;

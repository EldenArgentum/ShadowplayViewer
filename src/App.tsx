import "./App.css"
import GameCard from "./components/GameCard.tsx"
import { Button } from "@mantine/core"
import { useEffect, useState } from "react"

const App = () => {
	const [rootDir, setRootDir] = useState<string>("")
	const [subDirs, setSubDirs] = useState<string[]>([])

	// Load saved root directory on startup
	useEffect(() => {
		const savedRootDir = localStorage.getItem("rootDir")
		if (savedRootDir) {
			setRootDir(savedRootDir)
			// Load subdirectories from the saved root directory
			void handleLoadSubDirs(savedRootDir)
		}
	}, [])

	const handleReadDirectories = async () => {
		const rootDirInput = await window.ipcRenderer.rootDirDialog()
		if (rootDirInput) {
			setRootDir(rootDirInput)
			localStorage.setItem("rootDir", rootDirInput)

			// Load subdirectories from the new root directory
			void handleLoadSubDirs(rootDirInput)
		}
	}

	// This should be reused in the component when clicking on a subdirectory, to find of videos associated with a selected video.
	const handleLoadSubDirs = async (dir: string) => {
		const scanResult = await window.ipcRenderer.getSubDirs(dir)
		if (scanResult.success) {
			setSubDirs(Object.keys(scanResult.contents))
		} else {
			console.error("Error loading directories:", scanResult.error)
		}
	}

	return (
		<div style={{ minWidth: "100%" }}>
			<div className="button-container-top">
				<Button onClick={handleReadDirectories}>
					{rootDir
						? `Change Directory (Currently ${rootDir})`
						: "Select ShadowPlay Directory"}
				</Button>
			</div>

			<div className="game-grid">
				{subDirs.map(gameDir => (
					<GameCard
						key={gameDir}
						gameDir={gameDir}
						onLoadComplete={handleLoadedCard}
					/>
				))}
			</div>
		</div>
	)
}

export default App
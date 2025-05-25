import { ActionIcon, Card, Group, Image, Text } from "@mantine/core"
import { useHover } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { IconPencil, IconCarambola, IconTrash } from "@tabler/icons-react"
import { useState, useEffect } from "react"
import "./GameCard.css"
import { modals } from "@mantine/modals"

// Interface for props
interface GameCardProps {
	gameDir: string
	onLoadComplete: () => void
}

const GameCard = ({ gameDir, onLoadComplete }: GameCardProps) => {
	const { /* hovered: cardHovered, */ ref: cardRef } = useHover()
	const { hovered: editHovered, ref: editRef } = useHover()
	const { hovered: favHovered, ref: favRef } = useHover()
	const { hovered: deleteHovered, ref: deleteRef } = useHover()

	// CHANGE: Added isLoading state
	const [posterImage, setPosterImage] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(false)

	// Get the game name from the full path
	const getGameName = () => {
		const parts = gameDir.split(/[/\\]/)
		return parts[parts.length - 1] || gameDir
	}

	useEffect(() => {
		try {
			// Get saved posters from localStorage
			const savedPosters = localStorage.getItem("gamePosters")
			if (savedPosters) {
				const posters = JSON.parse(savedPosters)
				if (posters[gameDir]) {
					setPosterImage(posters[gameDir])
				}
			}
		} catch (error) {
			console.error("Error loading saved poster:", error)
		} finally {
			onLoadComplete()
		}
	}, [gameDir, onLoadComplete, posterImage])

	// CHANGE: Enhanced handleEdit with loading state and better localStorage handling
	const handleEdit = async () => {
		try {
			// CHANGE: Added loading state
			setIsLoading(true)

			// Open dialog for user to select an image, will return a file path to use
			const imagePath = await window.ipcRenderer.uploadPoster()
			if (!imagePath) {
				setIsLoading(false)
				return // User canceled
			}

			// Save the image to app storage and get data URL
			const result = await window.ipcRenderer.saveGamePoster(
				getGameName(),
				imagePath
			)

			// CHANGE: Reset loading state
			setIsLoading(false)

			if (result.success) {
				setPosterImage(result.dataUrl)

				const savedPosters = localStorage.getItem("gamePosters")
				const posters = savedPosters ? JSON.parse(savedPosters) : {}
				posters[gameDir] = result.dataUrl // Store the data URL
				localStorage.setItem("gamePosters", JSON.stringify(posters))
			}
		} catch (error) {
			// CHANGE: Reset loading state on error
			setIsLoading(false)
			console.error("Error updating poster:", error)
		}
	}

	const handleDelete = () => {
		const posters = JSON.parse(
			localStorage.getItem("gamePosters") as string
		)
		if (!posters[gameDir]) {
			notifications.show({
				title: "Silly Silly!",
				message: "You can't delete a poster that doesn't exist!",
				color: "red"
			})
			return
		}

		modals.openConfirmModal({
			title: "Delete Poster?",
			children: (
				<Text size="sm">
					Confirm to delete poster; this cannot be undone. Make sure
					you have the original copy!!!
				</Text>
			),
			labels: { confirm: "Delete", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onCancel: () => console.log("Cancel"),
			onConfirm: () => {
				delete posters[gameDir]
				localStorage.setItem("gamePosters", JSON.stringify(posters))
				setPosterImage(null)
				notifications.show({
					title: "Success!",
					message:
						"Successfully deleted the poster! Who needed that thing anyway?"
				})
			}
		})
	}

	// CHANGE: Updated render section with loading state and better placeholder
	return (
		<div
			className="card"
			ref={cardRef}
		>
			<Card
				radius={"md"}
				className="game-card"
			>
				<div className="image-container">
					{isLoading ? (
						// CHANGE: Added loading indicator
						<div className="placeholder-container">
							<div className="placeholder-content">
								<p>Loading...</p>
							</div>
						</div>
					) : posterImage ? (
						<Image
							src={posterImage}
							className="card-image"
						/>
					) : (
						<div className="placeholder-container">
							<div className="placeholder-content">
								<p>{getGameName()}</p>
								<p className="placeholder-hint">
									Click Edit to add a custom image
								</p>
							</div>
						</div>
					)}

					<div className="game-title">{getGameName()}</div>

					<div className={"button-container visible"}>
						<Group>
							<ActionIcon
								ref={editRef}
								onClick={handleEdit}
								variant={editHovered ? "filled" : "transparent"}
								radius="xl"
								size="md"
								color={editHovered ? "blue" : undefined}
								// CHANGE: Added loading state to button
								loading={isLoading}
							>
								<IconPencil size={16} />
							</ActionIcon>
							<ActionIcon
								ref={favRef}
								variant={favHovered ? "filled" : "transparent"}
								radius="xl"
								size="md"
								color={favHovered ? "yellow" : undefined}
							>
								<IconCarambola size={16} />
							</ActionIcon>
							<ActionIcon
								ref={deleteRef}
								onClick={handleDelete}
								variant={
									deleteHovered ? "filled" : "transparent"
								}
								radius="xl"
								size="md"
								color={deleteHovered ? "red" : undefined}
							>
								<IconTrash size={16} />
							</ActionIcon>
						</Group>
					</div>
				</div>
			</Card>
		</div>
	)
}

export default GameCard
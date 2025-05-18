import { ActionIcon, Card, Group, Image } from "@mantine/core"
import { useHover } from "@mantine/hooks"
import { IconPencil, IconCarambola, IconTrash } from "@tabler/icons-react"
import { useState, useEffect } from "react"

// Interface for props
interface GameCardProps {
    gameDir: string;
}

const GameCard = ({ gameDir }: GameCardProps) => {
    const { hovered, ref } = useHover();
    const [posterImage, setPosterImage] = useState<string | null>(null);

    // On component mount, check if we have a custom poster
    useEffect(() => {
        const posters = JSON.parse(localStorage.getItem('gamePosters') || '{}');
        if (posters[gameDir]) {
            setPosterImage(`file://${posters[gameDir]}`);
        }
    }, [gameDir]);

    // Handle edit button click - select and save new poster
    const handleEdit = async () => {
        try {
            // Open dialog for user to select an image
            const imagePath = await window.ipcRenderer.uploadPoster();
            if (!imagePath) return; // User canceled

            // Save the image to app storage
            const result = await window.ipcRenderer.saveGamePoster(gameDir, imagePath);

            if (result.success) {
                // Use the returned dataUrl directly
                setPosterImage(result.dataUrl);

                // Save to localStorage for persistence
                const posters = JSON.parse(localStorage.getItem('gamePosters') || '{}');
                posters[gameDir] = result.dataUrl; // Store the data URL
                localStorage.setItem('gamePosters', JSON.stringify(posters));
            }
        } catch (error) {
            console.error("Error updating poster:", error);
        }
    };

    // Get the game name from the full path
    const getGameName = () => {
        const parts = gameDir.split(/[\/\\]/);
        return parts[parts.length - 1] || gameDir;
    };

    return (
        <div className="card" ref={ref}>
            <Card radius={'md'} className="game-card">
                <div className="image-container">
                    {posterImage ? (
                        <Image src={posterImage} className="card-image" />
                    ) : (
                        <div className="placeholder-container">
                            <div className="placeholder-content">
                                <p>{getGameName()}</p>
                                <p className="placeholder-hint">Click Edit to add a custom image</p>
                            </div>
                        </div>
                    )}

                    <div className="game-title">{getGameName()}</div>

                    <div className={`button-container ${hovered ? 'visible' : ''}`}>
                        <Group spacing="xs">
                            <ActionIcon onClick={handleEdit} variant="filled" radius="xl" size="md" color="blue">
                                <IconPencil size={16} />
                            </ActionIcon>
                            <ActionIcon variant="filled" radius="xl" size="md" color="yellow">
                                <IconCarambola size={16} />
                            </ActionIcon>
                            <ActionIcon variant="filled" radius="xl" size="md" color="red">
                                <IconTrash size={16} />
                            </ActionIcon>
                        </Group>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default GameCard;
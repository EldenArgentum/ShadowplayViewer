import {ActionIcon, Card, Group, Image} from "@mantine/core"
import { useHover } from "@mantine/hooks"
import { IconPencil, IconCarambola, IconTrash } from "@tabler/icons-react"

const GameCard = ({image}: any) => {
    // resolution 600x900 for steamDB, I'm thinking 1200x1800 6:9

    const { hovered, ref } = useHover();

    return (
                <div className="card" ref={ref}>
                    <Card radius={'md'} className="game-card">
                        <div className="image-container">
                            <Image src={image} className="card-image" />

                            {/* Button container that shows on hover */}
                            <div className={`button-container ${hovered ? 'visible' : ''}`}>
                                <Group spacing="xs">
                                    <ActionIcon variant="filled" radius="xl" size="md" color="blue">
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
        )
}

export default GameCard
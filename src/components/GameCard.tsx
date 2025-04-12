import {Card, Image} from "@mantine/core";

const GameCard = ({image}: any) => {
    // resolution 600x900 for steamDB, I'm thinking 1200x1800 6:9
    return (
            <div>
                <Card radius={'md'}>
                    <Image src={image} radius={'md'}/>
                </Card>
            </div>
        )
}

export default GameCard
import "./App.css"
import Valorant from "./assets/Valorant.jpg"
import GameCard from "./components/GameCard.tsx"
import {Button, TextInput} from "@mantine/core"
import {useEffect, useState} from "react";


const App = () => {

    const [input, setInput] = useState('');
    const [output, setOutput] = useState<string>('');

    // const handleRead = async () => {
    //     const result = await window.directoryAPI.readDirectory(input);
    //     if (result.success) {
    //         setOutput(JSON.stringify(result.contents, null, 2));
    //     } else {
    //         setOutput(`Error: ${result.error}`);
    //     }
    // };


    return (
    <div style={{minWidth: "100%"}}>
        <div style={{gap: "100px"}}>
            <div className="text-field">
                <TextInput
                    radius="md"
                    label="Shadowplay Link"
                    description="Input Shadowplay folder directory that contains all game subdirectories (Ex: Dishonored, Monster Hunter: Wilds, R.E.P.O., StarCraft 2, Valorant)"
                    placeholder="F:\Shadowplay"
                    onChange={(e) => setInput(e.target.value)}
                    value={input}
                />
            </div>
            <div className="card">
                <GameCard image={Valorant}/>
            </div>
            <input type='file' />
        </div>
    </div>
  )
}

export default App
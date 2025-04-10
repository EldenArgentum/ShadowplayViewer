import "./App.css"
import Valorant from "./assets/Valorant.jpg"
import GameCard from "./components/GameCard.tsx"
import {TextInput} from "@mantine/core"
import {useEffect} from "react";
import {readFileSync} from "fs"



const App = () => {

    const files = readFileSync('/assets/', 'utf-8')
    useEffect(() => {
        console.log(files)
    }, [files]);
    // const img = new Image()
    // img.src = Valorant


    return (
    <div style={{minWidth: "100%"}}>
        <div style={{gap: "100px"}}>
            <div className="text-field">
                <TextInput
                    radius="md"
                    label="Shadowplay Link"
                    description="Input Shadowplay folder directory that contains all game subdirectories (Ex: Dishonored, Monster Hunter: Wilds, R.E.P.O., StarCraft 2, Valorant)"
                    placeholder="F:\Shadowplay"
                />
            </div>

            <div className="card">
                <GameCard image={Valorant}/>
            </div>
        </div>
    </div>
  )
}

export default App

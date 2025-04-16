import "./App.css"
import Valorant from "./assets/Valorant.jpg"
import GameCard from "./components/GameCard.tsx"
import {Button} from "@mantine/core"
import {useEffect, useState} from "react";

const App = () => {

    const [rootDir, setRootDir] = useState<string>('');
    const [subDirs, setSubDirs] = useState<[string]>()

    const handleRead = async () => {
        const rootDirInput = await window.ipcRenderer.rootDirDialog()
        setRootDir(rootDirInput)

        const scanSubDirs = await window.ipcRenderer.getSubDirs(rootDirInput)
        setSubDirs(scanSubDirs)
    }

    useEffect(() => {

    }, [rootDir, subDirs]);

    return (
    <div style={{minWidth: "100%"}}>

        <GameCard image={Valorant}/>

        <Button onClick={() => handleRead()}>
            This Will Open Up Dialog
        </Button>

    </div>
  )
}

export default App
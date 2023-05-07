import MessagesList from "@/components/MessagesList";
import {MessageType} from "@/utils/MessageType";
import Box from "@mui/material/Box";
import {useContext, useEffect, useLayoutEffect, useState} from "react";
import {favouriteMessage} from "@/utils/favouriteMessage";
import {MyAppContext} from "@/pages/_app";

export default function Favourite(props: any) {
    const [fav, setFav] = useState<MessageType[]>([])
    console.log("fav",fav)
    const ctx = useContext(MyAppContext);
    useLayoutEffect(() => {
        ctx.windowName.set("收藏")
    }, [])
    useLayoutEffect(() => {
            const favourites: MessageType[] = [...favouriteMessage.messages] ?? []
            console.log("useLayoutEffect favourites set")
            setFav(favourites)
        }, []
    )
    if (fav.length === 0) {
        return <Box>这里还什么都没有呢~</Box>
    }
    return <Box><MessagesList messages={fav}/></Box>

}
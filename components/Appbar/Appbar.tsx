import '@/styles/globals.css'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import React, {useContext} from "react";
import DoneIcon from '@mui/icons-material/Done';
import {AppBar, Avatar, IconButton, Slide, Typography, useScrollTrigger,} from "@mui/material";
import Toolbar from '@mui/material/Toolbar';
import MenuIcon from '@mui/icons-material/Menu';
import {useRouter} from "next/router";
import {MyAppContext} from "@/pages/_app";


function UserAvatar(props: any) {
    return (<Avatar
        sx={{width: 36, height: 36}}
        src={props.avatarSrc}
    ></Avatar>)
}

class StatusIcon extends React.Component<any, any> {
    state = {
        inner: (<IconButton><DoneIcon/></IconButton>)
    }
    setInfo = () => {

    }
    setWarning = () => {

    }
    setError = () => {

    }
    setOK = () => {

    }

    private setIcon = () => {

    }

    render() {
        return (<>{this.state.inner}</>)
    }
}


function HideAppBar(props: any) {
    const trigger = useScrollTrigger();
    const router = useRouter();
    const ctx = useContext(MyAppContext);

    function openMainMenu() {
        ctx.drawerOpen.set(true);
    }

    async function goHome() {
        await router.replace("/")
    }

    const iconBtnStyle = {
        size: 'large', edge: 'start', color: 'inherit', sx: {mr: 2}
    } as any
    return (
        <Slide appear={false} direction="down" in={!trigger}>
            <AppBar {...props}>
                <Toolbar>
                    <IconButton
                        aria-label="menu"
                        onClick={openMainMenu}
                        {...iconBtnStyle}
                    >
                        <MenuIcon/>
                    </IconButton>

                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                        {ctx.windowName.value}
                    </Typography>
                    <IconButton color="inherit" sx={{mr: 2}}>
                        {ctx.statusIcon}
                    </IconButton>
                    <IconButton
                        {...iconBtnStyle}
                        aria-label="home"
                        onClick={goHome}>
                        <HomeOutlinedIcon/>
                    </IconButton>
                    <IconButton color="inherit">
                        <UserAvatar avatarSrc={''}/>
                    </IconButton>
                </Toolbar>
            </AppBar>
        </Slide>
    )
}

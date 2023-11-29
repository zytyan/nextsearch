import '@/styles/globals.css'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import React, {useContext, useEffect, useState} from "react";
import {
    AppBar,
    Avatar,
    Card,
    CardContent,
    CardMedia, Container,
    Drawer,
    IconButton, LinearProgress,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Slide,
    Typography, useMediaQuery,
    useScrollTrigger,
} from "@mui/material";
import Toolbar from '@mui/material/Toolbar';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import {AppProps} from "next/app";
import Divider from '@mui/material/Divider';
import SearchIcon from "@mui/icons-material/Search";
import Router, {useRouter} from "next/router";
import {createTheme, ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import {enqueueSnackbar, SnackbarProvider} from 'notistack';
import ScrollToTopBtn from "@/components/ScrollToTopBtn";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import request from 'umi-request';

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

    useEffect(() => {
        if ((props.avatarUserId ?? 0) === 0) {
            return;
        }

        async function setAvatarFromNet() {
            const photo = await getProfilePhoto(props.avatarUserId)
            setAvatarSrc(photo)
        }

        setAvatarFromNet().then(_ => {
        });
    }, [ctx.userId, props.avatarUserId])
    const [avatarSrc, setAvatarSrc] = useState<string>('');
    const avatar = (<Avatar
        sx={{width: 36, height: 36}}
        src={avatarSrc}/>);
    return (
        <Slide appear={false} direction="down" in={!trigger}>
            <AppBar>
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{mr: 2}}
                        onClick={openMainMenu}>
                        <MenuIcon/>
                    </IconButton>

                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                        {ctx.windowName.value}
                    </Typography>
                    <IconButton color="inherit" sx={{mr: 2}}>
                        {ctx.statusIcon}
                    </IconButton>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{mr: 2}}
                        onClick={goHome}
                    >
                        <HomeOutlinedIcon/>
                    </IconButton>
                    <IconButton color="inherit">
                        {avatar}
                    </IconButton>
                </Toolbar>
            </AppBar>
        </Slide>
    )
}

export async function authTelegram(initData: any) {
    return "todo function";
}

declare global {
    interface Window {
        Telegram: any;
    }
}
const usernameCache: any = {};

export async function getUsername(userId: any) {
    if (usernameCache[userId]) {
        return usernameCache[userId];
    }
    usernameCache[userId] = new Promise((
        async (resolve, reject) => {
            const resp = await fetch(`/api/v1/tg/username?user_id=${userId}`);
            if (!resp.ok) {
                return reject(`${userId}`)
            }
            const json = await resp.json();
            resolve(json.name ?? `${userId}`);
        }
    ));
    return usernameCache[userId];
}

const profilePhoto: any = {};

export async function getProfilePhoto(userId: any) {
    if (profilePhoto[userId]) {
        return profilePhoto[userId];
    }
    profilePhoto[userId] = new Promise(
        async (resolve, reject) => {
            const resp = await fetch(`/api/v1/tg/profile_photo?user_id=${userId}`);
            if (!resp.ok) {
                reject("not ok");
            }
            const blob = await resp.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                resolve(reader.result);
            }
        }
    )
    return profilePhoto[userId];
}

interface Setter<T> {
    value: T
    set: (newVal: T) => void;
}

function DarkModeMenu() {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const ctx = useContext(MyAppContext);
    const manualDark = ctx.preferDarkMode.value && !ctx.darkModeFollowSystem.value;
    const manualLight = !ctx.preferDarkMode.value && !ctx.darkModeFollowSystem.value;
    const auto = ctx.darkModeFollowSystem.value;

    const handleClose = (event: React.MouseEvent<HTMLElement>) => {
        const {myValue} = event.currentTarget.dataset;
        switch (myValue) {
            case 'light':
                ctx.darkModeFollowSystem.set(false);
                ctx.preferDarkMode.set(false);
                break;
            case 'dark':
                ctx.darkModeFollowSystem.set(false);
                ctx.preferDarkMode.set(true);
                break;
            case 'system':
                ctx.darkModeFollowSystem.set(true);
                // @ts-ignore
                ctx.preferDarkMode.set(window.Telegram.WebApp.colorScheme === "dark")
                break;
        }
        setAnchorEl(null);
    };
    const sideBar = (<Box bgcolor="primary.main"
                          sx={{width: 4, maxWidth: 4, height: '90%', position: 'absolute', zIndex: 1, marginLeft: -1}}
    ></Box>);
    return <Box>
        <IconButton sx={{marginLeft: 'auto', float: 'right'}} onClick={handleClick}>
            <LightModeOutlinedIcon sx={{color: 'white'}}/>
        </IconButton><Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
            'aria-labelledby': 'basic-button',
        }}
    >
        <MenuItem onClick={handleClose} data-my-value={'light'}>
            {manualLight ? sideBar : <></>}
            亮色模式
        </MenuItem>
        <MenuItem onClick={handleClose} data-my-value={'dark'}>
            {manualDark ? sideBar : <></>}
            暗色模式
        </MenuItem>
        <MenuItem onClick={handleClose} data-my-value={'system'}>
            {auto ? sideBar : <></>}
            跟随系统
        </MenuItem>
    </Menu></Box>
}

function MainMenu() {
    const router = useRouter();
    const ctx = useContext(MyAppContext);

    function routeTo(url: string) {
        return () => {
            // noinspection JSIgnoredPromiseFromCall
            router.replace(url, undefined, {shallow: true});
        }
    }

    const close = () => {
        ctx.drawerOpen.set(false);
    };

    return <Drawer open={ctx.drawerOpen.value}
                   onClose={close}>
        <Box width={250}>
            <Box sx={{
                position: 'absolute',
                zIndex: 1,
                width: '100%',
                background: 'linear-gradient(to bottom, #000000ff 15%,75%, #00000000)'
            }}>
                <DarkModeMenu/>
            </Box>
            <Box role="presentation"
                 onClick={close}>
                <Card sx={{
                    maxWidth: '100%',
                    borderRadius: 0,
                    boxShadow: 0,
                }}>

                    <CardMedia
                        sx={{height: 140}}
                        image="/static/contemplative-reptile.jpg"
                        title="green iguana"
                    />

                    <CardContent>
                        <Typography gutterBottom variant="h5" component="div">
                            Ytyan Web
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            吹水群第一个Telegram小程序，由吹水群群主z ( @Ytyan ) 开发。<br/>
                            当前仅支持消息搜索功能，会视时间和情况增加新功能。
                        </Typography>
                    </CardContent>
                </Card>
                <List>
                    <ListItem disablePadding>
                        <ListItemButton onClick={routeTo("/")}>
                            <ListItemIcon>
                                <HomeOutlinedIcon/>
                            </ListItemIcon>
                            <ListItemText primary={"主页"}/>
                        </ListItemButton>
                    </ListItem>
                </List>
                <Divider/>
                <List>
                    <ListItem disablePadding>
                        <ListItemButton onClick={routeTo("/search")}>
                            <ListItemIcon>
                                <SearchIcon/>
                            </ListItemIcon>
                            <ListItemText primary={"搜索"}/>
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton onClick={routeTo("/favourite")}>
                            <ListItemIcon>
                                <StarBorderIcon/>
                            </ListItemIcon>
                            <ListItemText primary={"收藏"}/>
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
        </Box>
    </Drawer>
}

function useStateWithProp<T>(initial: T): Setter<T> {
    const [getter, setter] = useState(initial);
    return {
        value: getter,
        set: setter,
    }
}

function useRunOnce(cb: any) {
    const [ran, setRan] = useState(false);
    useEffect(() => {
        if (ran) {
            return;
        }
        cb()
        setRan(true);
    }, [ran])
}

export const MyAppContext = React.createContext<Setter<any> | any>({
    authing: null,
    windowName: null,
    drawerOpen: null,
    statusIcon: null,
    authTelegram: null,
    preferDarkMode: null,
    darkModeFollowSystem: null,
    userId: null,
    authToken: null,
});
// 自动添加header
request.use(async (ctx, next) => {
    let authData = ""
    if (window.Telegram?.WebApp?.initData !== undefined) {
        authData = `Telegram ${window.Telegram.WebApp.initData}`
    } else {
        authData = window.localStorage.getItem('auth') ?? ''
    }
    ctx.req.options.headers = {
        Authorization: authData,
        ...ctx.req.options.headers,
    }
    await next();
}, {global: true})

export default function App({Component, pageProps}: AppProps) {
    const [authing, setAuthing] = useState(false);
    const [verified, setVerified] = useState(false);
    const preferDarkMode = useStateWithProp(false);
    const darkModeFollowSystem = useStateWithProp(true);
    const userId = useStateWithProp(0);
    const authToken = useStateWithProp('');
    const value = {
        authing: {value: authing, set: setAuthing},
        windowName: useStateWithProp("Home"),
        drawerOpen: useStateWithProp(false),
        preferDarkMode, darkModeFollowSystem,
        authTelegram, userId, authToken
    }
    useEffect(() => {
        if (localStorage.userId) {
            try {
                value.userId.set(parseInt(localStorage.userId))
            } catch {
            }
        }

        if (!verified) {
            return;
        }
        const startParam = Router.query.tgWebAppStartParam;
        if (!startParam) {
            return;
        }
    }, [verified, userId])
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    useRunOnce(() => {
        if (localStorage.userId) {
            try {
                userId.set(parseInt(localStorage.userId))
            } catch {
            }
        }
        window.Telegram?.WebApp?.ready();
        // 此处用来保存
        const config = JSON.parse(localStorage.config ?? '{}');
        preferDarkMode.set(config.preferDarkMode ?? preferDarkMode.value);
        darkModeFollowSystem.set(config.darkModeFollowSystem ?? darkModeFollowSystem.value);
        const saveConfig = () => {
            const newConfig = {
                preferDarkMode: preferDarkMode.value,
                darkModeFollowSystem: darkModeFollowSystem.value,
            }
            window.localStorage.setItem('config', JSON.stringify(newConfig));
        }
        window.addEventListener('beforeunload', saveConfig);
    })
    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: preferDarkMode.value ? 'dark' : 'light',
                },
            }),
        [preferDarkMode.value],
    );
    useRunOnce(() => {
        const themeChangedCallback = () => {
            if (darkModeFollowSystem) {
                // @ts-ignore
                preferDarkMode.set(window.Telegram.WebApp.colorScheme === "dark")
            }
        }
        // @ts-ignore
        window.Telegram.WebApp.onEvent('themeChanged', themeChangedCallback)
        if (darkModeFollowSystem) {
            // @ts-ignore
            preferDarkMode.set(window.Telegram.WebApp.colorScheme === "dark");
        }
    })
    useEffect(() => {
        // @ts-ignore
        const telegram = window.Telegram;
        userId.set(telegram.WebApp.initDataUnsafe.user?.id ?? 0);
        if (authing) {
            return;
        }
        setAuthing(_ => true);
        if (!telegram) {
            enqueueSnackbar("无telegram对象，当前环境可能不是telegram客户端，请尝试使用telegram客户端启动网页。", {variant: "warning"})
            return;
        }
        const initData = telegram?.WebApp?.initData;
        if (!initData) {
            // enqueueSnackbar("没有初始化数据，可能并不是从链接打开的当前页。请尝试使用链接打开。", {variant: "warning"})
            return;
        }
        authTelegram(initData).then((result) => {
            console.log(result);
            setAuthing(_ => true);
            userId.set(telegram.WebApp.initDataUnsafe.user?.id ?? 0);
            const token = window.localStorage.getItem('auth');
            if (token === null) {
                return;
            }
            authToken.set(token);
        }).catch((result) => {
            enqueueSnackbar(result, {variant: "warning"})
            setAuthing(_ => false);
        });
    }, [])
    const [processing, setProcessing] = useState(0);
    useRunOnce(() => {
        request.use(async (ctx, next) => {
            setProcessing(p => p + 1)
            try {
                await next();
            } finally {
                setProcessing(p => p - 1)
            }
        })
    })
    return <>
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <SnackbarProvider maxSnack={4}>
                <MyAppContext.Provider value={value}>
                    <HideAppBar {...pageProps} avatarUserId={userId.value}/>

                    <MainMenu {...pageProps}/>

                    <Box sx={{
                        height: 64, width: "100%",
                    }}></Box>
                    {processing > 0 ? <Box sx={{width: '100%'}}>
                        <LinearProgress/>
                    </Box> : <></>}
                    <Box sx={{
                        height: 16, width: "100%",
                    }}></Box>
                    <Container sx={{
                        width: "100%", maxWidth: "50em",
                        alignItems: "center",
                        display: "flex", flexDirection: 'column',
                    }}>

                        <Component {...pageProps}/>
                    </Container>
                    <ScrollToTopBtn {...pageProps}/>
                </MyAppContext.Provider>
            </SnackbarProvider>
        </ThemeProvider>
    </>
}

import Head from 'next/head'
import React, {useContext, useLayoutEffect} from "react";
import {Button, Card, CardActions, CardContent, List, ListItem, Typography} from "@mui/material";
import {useRouter} from "next/router";
import {MyAppContext} from "@/pages/_app";

export default function Home(props: any) {
    const router = useRouter();

    function routeTo(url: string) {
        return () => {
            // noinspection JSIgnoredPromiseFromCall
            router.replace(url);
        }
    }

    const ctx = useContext(MyAppContext);
    useLayoutEffect(() => {
        ctx.windowName.set("主页");
    }, [])
    // @ts-ignore
    return (
        <><Head>
            <title>Ytyan Bot</title>
            <meta name="description" content="Ytyan App"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <link rel="icon" href="/favicon.ico"/>
        </Head>
            <List>
                <ListItem>
                    <Card sx={{width: '100%', maxWidth: '50em'}}>
                        <CardContent>
                            <Typography variant="h5" sx={{mb: 1.5}}>
                                搜索
                            </Typography>
                            <Typography variant="body2">
                                搜索历史消息，该功能采用全文索引技术，结果可能并不完全相关。
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button variant="contained" onClick={routeTo("/search")}>
                                前往搜索
                            </Button>
                        </CardActions>
                    </Card>
                </ListItem>
                <ListItem>
                    <Card sx={{width: '100%', maxWidth: '50em'}}>
                        <CardContent>
                            <Typography variant="h5" sx={{mb: 1.5}}>
                                收藏
                            </Typography>
                            <Typography variant="body2">
                                消息收藏使用localStorage实现，所以不仅不能跨平台，它什么都不能跨。
                                <del>尤其不能跨性别。</del>
                            </Typography>
                            <Typography variant="body2">
                                如果想留着这些消息，那么不要清理tg缓存，<del>王冠会掉</del>消息会消失。懒狗开发不想写远程存储的逻辑了。
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button variant="contained" onClick={routeTo("/favourite")}>
                                前往收藏
                            </Button>
                        </CardActions>
                    </Card>
                </ListItem>
                <ListItem>
                    <Card sx={{width: '100%', maxWidth: '50em'}}>
                        <CardContent>
                            <Typography variant="h5" sx={{mb: 1.5}}>
                                网页验证
                            </Typography>
                            <Typography variant="body2">
                                鉴于iOS telegram的问题一大堆，所以开发了网页验证。
                            </Typography>
                            <Typography variant="body2">
                                可以使用bot在网页中验证，这样搜索就可以在网页中进行了。但是暂时还没想到怎么给别的群搜索，目前搜索还是吹水群独享的功能。
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button variant="contained" onClick={routeTo("/verify")}>
                                前往验证
                            </Button>
                        </CardActions>
                    </Card>
                </ListItem>
            </List>
        </>
    )
}

import {Button, Link, TextField, Typography} from "@mui/material";
import {useContext, useLayoutEffect, useState} from "react";
import Box from "@mui/material/Box";
import {MyAppContext} from "@/pages/_app";
import {enqueueSnackbar} from "notistack";

function openBotVerifyLink() {
    window.open('https://t.me/ytyan_bot?start=gen_browser_login_key', "_blank")
}

async function verifyUser(token: string) {
    const option = {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf8",
        },
        body: JSON.stringify({data: token})
    }
    const resp = await fetch("/api/v1/tg/auth_in_browser", option)
    if (!resp.ok) {
        const text = await resp.text()
        enqueueSnackbar(`Telegram 验证失败，错误：${text}`, {variant: "warning"})
        return null
    }
    enqueueSnackbar(`Telegram 验证成功。`, {variant: "success"})
    return await resp.json()
}

function getCookie(name: string) {
    const dc = document.cookie;
    const prefix = name + "=";
    let begin = dc.indexOf("; " + prefix);
    let end
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    } else {
        begin += 2;
        end = document.cookie.indexOf(";", begin);
        if (end == -1) {
            end = dc.length;
        }
    }
    // because unescape has been deprecated, replaced with decodeURI
    //return unescape(dc.substring(begin + prefix.length, end));
    return decodeURI(dc.substring(begin + prefix.length, end));
}

export default function Verify() {
    const [token, setToken] = useState('')
    const [inputDisabled, setInputDisabled] = useState(false)
    const [btnDisabled, setBtnDisabled] = useState(false)
    const [btnText, setBtnText] = useState('点我验证')
    const ctx = useContext(MyAppContext);

    useLayoutEffect(() => {
        ctx.windowName.set("验证")
        if (ctx.userId.value !== 0) {
            setAuthed()
        }
    }, []);

    function setAuthed() {
        setBtnText("已经验证过了")
        setInputDisabled(true)
        setBtnDisabled(true)
    }

    function setTokenText(e: any) {
        const value: string = e.currentTarget.value
        if (value.match(/^[a-zA-Z0-9_.-]*$/)) {
            setToken(value)
        }
    }

    async function verify() {
        setBtnDisabled(true)
        const ret = await verifyUser(token)
        if (!ret || !ret.ok) {
            return
        }
        const user_id = ret.user_id
        if (user_id) {
            ctx.userId.set(user_id)
            localStorage.userId = `${user_id}`
            setAuthed()
        }

    }

    return (<Box sx={{width: "100%", maxWidth: "32em"}}>
        <Typography>1. 前往Bot处获取token。进入Telegram后，点击聊天栏处的start即可。</Typography>
        <Box sx={{mb: 1}}/>
        <Button onClick={openBotVerifyLink} variant="contained" fullWidth>
            点击前往bot处获取token。
        </Button>
        <Box sx={{mb: 5}}/>
        <Typography>2. 在下方输入或粘贴从Bot处获得的Token</Typography>
        <Box sx={{mb: 1}}/>
        <TextField
            disabled={inputDisabled}
            label="输入从bot中得到的token"
            fullWidth
            style={{textAlign: 'left'}}
            value={token}
            onChange={setTokenText}
            multiline
            minRows={5}
        />
        <Box sx={{mb: 5}}/>
        <Typography>3. 点击下方的按钮进行验证</Typography>
        <Box sx={{mb: 1}}/>
        <Button onClick={verify} disabled={btnDisabled} variant="contained" fullWidth>
            {btnText}
        </Button>
    </Box>)
}
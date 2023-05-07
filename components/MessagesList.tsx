import React, {Component, useRef, useState} from "react";
import {getProfilePhoto, getUsername} from "@/pages/_app";
import {Avatar, Card, CardContent, CardHeader, IconButton, List, ListItem, Typography} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {enqueueSnackbar} from "notistack";
import Popper from "@mui/material/Popper";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import {amber, blue, blueGrey, brown, cyan, deepOrange, grey, pink, red, teal, yellow} from "@mui/material/colors";
import {MessageType} from '@/utils/MessageType'
import {favouriteMessage} from "@/utils/favouriteMessage";
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : [0, 0, 0]
}

function decideFontColor(hexRgb: string) {
    const rgb = hexToRgb(hexRgb)
    const c = rgb.map(c => {
        c = c / 255
        if (c <= 0.03928) {
            return c / 12.92;
        } else {
            return Math.pow((c + 0.055) / 1.055, 2.4);
        }
    })
    const L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    return (L > 0.45) ? '#666' : '#eee';
}

function getRandomColorBaseId(id: any) {
    const colorList = [
        red['A200'],
        amber['A200'],
        blue['A200'],
        blueGrey['A200'],
        brown['A200'],
        cyan['A200'],
        deepOrange['A200'],
        grey['A200'],
        pink['A200'],
        teal['A200'],
        yellow['A200'],
    ]
    const str = id.toString()
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + code;
        hash = hash & hash; // Convert to 32bit integer
    }
    hash = hash >= 0 ? hash : -hash
    const index = hash % colorList.length
    const bgColor = colorList[index]
    const fontColor = decideFontColor(bgColor)
    return [bgColor, fontColor]
}

export function MessageNodeMenu(props: any) {
    const {msgLink, searchMenuAnchor} = props
    const [open, setOpen] = props.menuOpen
    const handleClose = () => {
        setOpen(false);
    }
    const handleToMessage = () => {
        try {
            //@ts-ignore
            window.Telegram.WebApp.openTelegramLink(msgLink);
        } catch (e) {
            enqueueSnackbar("ERROR", {variant: "error"});
        } finally {
            handleClose()
        }
    }

    return (
        <Popper sx={{width: 180, maxWidth: '100%'}}
                anchorEl={searchMenuAnchor.current}
                open={open}>
            <Grow in={open}><Paper><ClickAwayListener onClickAway={handleClose}><MenuList>
                <MenuItem onClick={handleToMessage} disabled={!Boolean(msgLink)}>
                    <RemoveRedEyeOutlinedIcon sx={{mr: 1}}/>查看
                </MenuItem>
            </MenuList></ClickAwayListener></Paper></Grow>
        </Popper>
    );
}

export class MessageNode extends Component<any, any> {
    constructor(props: any) {
        super(props);
        const result = props.result;
        const [bgColor, fontColor] = getRandomColorBaseId(result.from_id)
        this.state = {
            username: `${result.from_id}`,
            profilePhoto: '',
            baseUrl: '',
            bgColor, fontColor,
            showMore: false,
        }
    }

    isFavMsg() {
        const msg = this.props.result
        let isFavouriteMsg = false
        if (msg !== null) {
            isFavouriteMsg = favouriteMessage.has(msg)
        }
        return isFavouriteMsg
    }

    getFavIcon = () => {
        return this.isFavMsg() ? <StarIcon sx={{color: yellow[800]}}/> : <StarBorderIcon/>
    }
    handleFav = () => {
        const msg = this.props.result
        if (this.isFavMsg()) {
            favouriteMessage.remove(msg)
        } else {
            favouriteMessage.add(msg)
        }
        favouriteMessage.save()
        this.setState({})
    }
    setUsernameAndProfilePhoto = () => {
        getUsername(this.props.result.from_id)
            .then(username => {
                if (!username) {
                    return null;
                }
                this.setState({username})
                return username;
            }).catch(_ => {
            this.setState({username: `Unknown(id=${this.props.result.from_id})`});
        });
        getProfilePhoto(this.props.result.from_id)
            .then(profilePhoto => {
                if (!profilePhoto) {
                    return null
                }
                this.setState({profilePhoto})
                return profilePhoto
            }).catch(_ => {
            this.setState({profilePhoto: ''})
        });
        const [bgColor, fontColor] = getRandomColorBaseId(this.props.result.from_id)
        this.setState({bgColor, fontColor,})
        let peerId = this.props.result.peer_id;
        if (peerId > 0) {
            return
        }
        peerId = -peerId;
        if (peerId > 1000000000000) {
            peerId -= 1000000000000;
            const baseUrl = `https://t.me/c/${peerId}`;
            this.setState({baseUrl});
        }
    }
    getDateStr = () => {
        const datetime = new Date(this.props.result.date * 1000);
        const year = datetime.getFullYear().toString().padStart(4, '0');
        const month = (datetime.getMonth() + 1).toString().padStart(2, '0');
        const date = datetime.getDate().toString().padStart(2, '0');
        const hour = datetime.getHours().toString().padStart(2, '0');
        const minute = datetime.getMinutes().toString().padStart(2, '0');
        return `${year}-${month}-${date} ${hour}:${minute}`;
    }

    msgLink = () => {
        if (this.state.baseUrl) {
            return `${this.state.baseUrl}/${this.props.result.msg_id}`;
        }
        return '';
    }

    openSearchMenu = (event: React.MouseEvent) => {
        const newLink = this.msgLink()
        this.props.searchMenuAnchor.current = event.currentTarget
        this.props.setMsgLink(newLink)
        this.props.setMsg(this.props.result)
        this.props.setMenuOpen(true)
    }

    componentDidMount() {
        this.setUsernameAndProfilePhoto()
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any) {
        if (prevProps.result === this.props.result) {
            return;
        }
        this.setState({
                result: this.props.result,
            }, () => {
                this.setUsernameAndProfilePhoto();
            }
        )
    }


    render() {
        return (
            <Card sx={{width: '100%', minHeight: '3em'}}>
                <CardHeader
                    avatar={
                        <Avatar sx={{
                            bgcolor: this.state.bgColor, color: this.state.fontColor,
                        }}
                                src={this.state.profilePhoto}>
                            {this.state.username.slice(0, 1)}
                        </Avatar>
                    }
                    action={
                        <>
                            <IconButton sx={{mr: 1}} onClick={this.handleFav}>{this.getFavIcon()}</IconButton>
                            <IconButton onClick={this.openSearchMenu}><MoreVertIcon/></IconButton>
                        </>}
                    title={this.state.username}
                    subheader={this.getDateStr()}
                />
                <CardContent>
                    {this.props.result.message.split(/\r?\n/)
                        .map((str: string, idx: number) => (<Typography key={idx}>{str}</Typography>))}
                </CardContent>

            </Card>
        );
    }
}


export default function MessagesList(props: any) {
    const {messages} = props
    const menuOpen = useState(false)
    const [msgLink, setMsgLink] = useState('')
    const [msg, setMsg] = useState<MessageType | null>(null)
    const searchMenuAnchor = useRef(null)
    return (
        <>
            <MessageNodeMenu
                menuOpen={menuOpen} msgLink={msgLink}
                msg={msg}
                searchMenuAnchor={searchMenuAnchor}/>
            <List sx={{maxWidth: "100%"}}>
                {messages.map((obj: MessageType) => (
                    <ListItem key={obj.mongo_id}>
                        <MessageNode
                            setMenuOpen={menuOpen[1]}
                            setMsgLink={setMsgLink}
                            searchMenuAnchor={searchMenuAnchor}
                            result={obj}
                            setMsg={setMsg}
                            {...props}/>
                    </ListItem>))}
            </List>
        </>
    )
}
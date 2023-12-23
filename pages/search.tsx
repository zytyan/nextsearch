import React, {useContext, useLayoutEffect, useState} from 'react';
import {Box, Button, Card, CircularProgress, Container, IconButton, SxProps, TextField} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import {MyAppContext} from "@/pages/_app";
import {enqueueSnackbar} from 'notistack';
import MessagesList from "@/components/MessagesList"
import request from 'umi-request';

function stubSearchResult(count: number, query: string, page: number) {
    const out = [];
    const now = Date.now()
    const offset = (page - 1) * count;
    for (let i = offset; i < offset + count; i++) {
        out.push({
            message: `搜索桩函数 - ID: ${i}\nquery: ${query}\n你不应该看到这个搜索结果，这是一个搜索错误。但是我还没有开发出错误界面，如果有问题，请联系开发者。\n` +
                `如果你是在浏览器中打开的本网页，那么请回到telegram，我还没有做出浏览器直接鉴权的方式。\n` +
                `如果你不知道谁是开发者，那你先别用这个功能，等我加上了链接模块再说。\n` +
                `五一假期已经过完了，我可能没有什么时间再去写前端了，又要回去做社畜了，我也没有办法。`,
            date: (now + (i * 60 * 83 * 1000)) / 1000,
            from_id: `桩结果 - ${i}`,
            peer_id: -1001888888888,
            msg_id: 10000 + i,
            mongo_id: `${query}-${i}`,
            image_text: "这是测试测试测试图片中的文字显示"
        })
    }
    return {
        result: {
            hits: out
        }
    }
}

function LoadMoreBtn(props: any) {
    // 没搜索的时候不显示
    // 搜索后有加载更多
    // 搜索时显示转圈的加载中
    // 搜索到底（返回空数组显示没有更多了并变灰，但是开发环境中不变灰，可以继续点击
    const {loadMore, notDisplay, noMore, loading} = props
    let disabled = false
    const boxSx = notDisplay ? {display: "none"} : {} as SxProps

    const loadMoreComp = <>加载更多</>
    const loadingComp = <>
        <CircularProgress
            size={'1.4em'}
            sx={{mr: 2}}/>加载中</>
    const noMoreComp = <>没有更多了</>
    let comp
    if (noMore) {
        comp = noMoreComp
    } else if (loading) {
        disabled = true
        comp = loadingComp
    } else {
        comp = loadMoreComp
    }
    return (
        <Box sx={boxSx}><Button variant="contained"
                                onClick={loadMore}
                                disabled={disabled}
                                sx={{width: "10em", mb: 5}}>
            {comp}
        </Button></Box>
    )
}

async function getResult(query: string, page: number) {
    // @ts-ignore
    const telegram = window.Telegram;
    const option = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json; charset=utf8",
        },
        body: JSON.stringify({
            q: query,
            // fixme: 这里应该改成其他的可用的群，但是我暂时想不到他妈的应该怎么过滤，懒狗不想动了，又他妈的没工资
            ins_id: telegram?.WebApp?.initDataUnsafe?.chat_instance,
            page: page,
        }),
    }
    try {
        const resp = await request.post(`https://tgapi.zchan.moe/api/v1/tg/search`, option);
        console.log(resp, typeof resp);
        // @ts-ignore
        window.resp = resp;
        // @ts-ignore
        window.request = request;
        return {result: resp};
    } catch (e) {
        enqueueSnackbar(`搜索失败，请前往通知区域检查API返回值。 Code: ${e}`, {variant: "error"})
        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
            // dev code
            return stubSearchResult(1, query, page);
        }
        return {result: {hits: []}}
    }
}

export default function Search(props: any) {
    const [page, setPage] = useState(0)
    const [results, setResults] = useState([])
    const [lastQuery, setLastQuery] = useState('')//用于加载更多时防止query变化
    const [searchInput, setSearchInput] = useState('')
    const [searchErr, setSearchErr] = useState(false);
    const [loading, setLoading] = useState(false)
    const ctx = useContext(MyAppContext);
    useLayoutEffect(() => {
        ctx.windowName.set("搜索")
    }, []);


    async function loadFirstPage() {
        // @ts-ignore
        const query = searchInput.trim()
        if (!query) {
            setSearchErr(true)
            return;
        }
        if (lastQuery === query) {
            // 没更改搜索内容，那就不要刷新
            return;
        }
        setSearchErr(false)
        setLastQuery(searchInput)
        document.title = `${searchInput} - 搜索结果`;
        setLoading(true)
        try {
            const data = await getResult(searchInput, 1);
            setResults(data.result.hits);
            setPage(2);
        } finally {
            setLoading(false)
        }
    }

    async function loadMore() {
        setLoading(true)
        try {
            const data = await getResult(lastQuery, page + 1);
            setPage(prevState => prevState + 1);
            setResults(results.concat(data.result.hits));
        } finally {
            setLoading(false)
        }
    }

    return (
        <><Box pl={2} pr={2} width={'100%'}><TextField
            fullWidth
            label='搜索' variant="outlined"
            value={searchInput} onChange={event => setSearchInput(event.target.value)}
            error={searchErr}
            onKeyUp={async (event) => {
                if (event.key == 'Enter') {
                    await loadFirstPage()
                }
            }}
            InputProps={{
                endAdornment: (<IconButton onClick={loadFirstPage}><SearchIcon/></IconButton>)
            }}
        /></Box>
            <MessagesList messages={results}/>
            <LoadMoreBtn loadMore={loadMore} noMore={results.length === 0} notDisplay={page === 0} loading={loading}/>
        </>
    );
}
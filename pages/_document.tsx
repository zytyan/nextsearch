import {Head, Html, Main, NextScript} from 'next/document'
import Script from "next/script";


export default function Document() {
    return (
        <Html lang="en">
            <Head/>
            <body>
            <Main/>
            <Script src={"https://telegram.org/js/telegram-web-app.js"}
                    strategy="beforeInteractive"/>
            <NextScript/>
            </body>
        </Html>
    )
}

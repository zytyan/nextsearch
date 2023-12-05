import {Head, Html, Main, NextScript} from 'next/document'

export default function Document() {
    return (
        <Html lang="en">
            <Head>
            <script src={"https://telegram.org/js/telegram-web-app.js"}
                    data-nscript="beforeInteractive" defer={true}/>
            </Head>
            <body>
            <Main/>
            <NextScript/>
            </body>
        </Html>
    )
}

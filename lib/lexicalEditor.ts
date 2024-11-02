import { escape } from "querystring"

export const generateLexicalHTMLToIframe = (lexicalEditorContent: string) => {
    return `data:text/html;charset=utf-8,
    <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    font-size: 16px;
                    line-height: 1.3;
                    padding: 20px;
                    height: 100%;
                    overflow: hidden;
                }
            </style>
        </head>
        <body>
            ${escape(lexicalEditorContent)}
        </body>
    </html>`
}
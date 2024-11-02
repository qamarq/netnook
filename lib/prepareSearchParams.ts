export const getSearchParams = (url: string) => {
    const string = url.substring(url.lastIndexOf('/')+1)
    const [_, paramsRAW] = string.split('?')
    const params = paramsRAW ? (paramsRAW.split('&').reduce((acc, param) => {
        const [key, value] = param.split('=')
        acc[key] = value
        return acc
    }, {} as Record<string, string>)) : []
    console.log(url)
    return params
}
import colors from 'picocolors'
import fetch from "node-fetch"
import { parseThemeData } from './theme'

const VITE_CLIENT = '<script type="module" src="/@vite/client"></script>'


export interface ResponseData {
  status: number;
  message?: string;
  html?: string;
  duration?: number;
}


async function request (api: string, root: string, url: string): Promise<ResponseData> {
  const theme = await parseThemeData(root)
  const data: Record<string, any> = { url, theme }
  if (theme.context) {
    // for debugging context
    data.override_context = theme.context
  }
  const body = JSON.stringify(data)
  const resp = await fetch(api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  })
  return resp.json() as Promise<ResponseData>
}


export async function createDevServer (env: Record<string, string>, root: string, url: string) {
  // TODO
  const api = env.VITE_THEME_DEVELOP_API || ""
  const data = await request(api, root, url)
  let message: string
  if (data.status === 200) {
    message = colors.green(`"GET ${url} HTTP/1.1"`) + ` ${data.status} ${data.duration}ms`
  } else {
    message = colors.red(`"GET ${url} HTTP/1.1"`) + ` ${data.status}`
  }
  // TODO: config.logger.info(message, { timestamp: true })
  if (data.status === 200) {
    // inject /@vite/client
    return data.html!.replace('<head>', `<head>\n${VITE_CLIENT}`)
  } else {
    return `<html><head>${VITE_CLIENT}</head><body><pre>${data.status}: ${data.message}</pre></body></html>\n`
  }
}

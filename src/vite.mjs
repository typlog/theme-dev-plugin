import colors from 'picocolors'
import fetch from "node-fetch"
import { parseDevThemeData } from './theme.mjs'

const VITE_CLIENT = '<script type="module" src="/@vite/client"></script>'


async function request (api, root, url) {
  const theme = await parseDevThemeData(root)
  const data = { url, theme }
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
  return resp.json()
}


export const themeDevServer = () => {
  /** @type {import('vite').ResolvedConfig} */
  let config
  return {
    name: 'typlog-theme-dev-server',

    /** @param {import('vite').ResolvedConfig} resolvedConfig */
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },

    /**
     * @param {string} html
     * @returns {Promise<string>}
     */
    async transformIndexHtml(html, ctx) {
      if (config.command === "serve") {
        const api = config.env.VITE_THEME_DEVELOP_API || "https://api.typlog.com/v4/theme/develop"
        const data = await request(api, config.root, ctx.originalUrl)
        let message
        if (data.status === 200) {
          message = colors.green(`"GET ${ctx.originalUrl} HTTP/1.1"`) + ` ${data.status} ${data.duration}ms`
        } else {
          message = colors.red(`"GET ${ctx.originalUrl} HTTP/1.1"`) + ` ${data.status}`
        }
        config.logger.info(message, { timestamp: true })
        if (data.status === 200) {
          // inject /@vite/client
          return data.html.replace('<head>', `<head>\n${VITE_CLIENT}`)
        } else {
          return `<html><head>${VITE_CLIENT}</head><body><pre>${data.status}: ${data.message}</pre></body></html>\n`
        }
      } else {
        return html
      }
    },
  }
}

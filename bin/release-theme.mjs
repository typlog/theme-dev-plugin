#!/usr/bin/env node

import { loadThemeData, updateTemplatesContext, submitTheme } from "@typlog/theme-dev-plugin"

const API_URL = process.env.THEME_SUBMIT_API || 'https://api.typlog.com/v4/theme/submit'
const API_TOKEN = process.env.THEME_SUBMIT_TOKEN

async function release () {
  // load current directory's theme data
  const theme = await loadThemeData(process.cwd())

  // use GitHub releases files
  const staticURL = `https://ui.typlog.com/gh/${theme.repo}/${theme.version}`
  updateTemplatesContext(theme.templates, {_static_url: staticURL})

  // send theme to api endpoint
  const resp = await submitTheme(API_URL, API_TOKEN, theme)
  if (resp.status >= 400) {
    console.error(`[${resp.status}] ${resp.statusText}`)
    const result = await resp.json()
    console.info(JSON.stringify(result, null, 2))
    process.exit(1)
  } else if (resp.status < 300) {
    console.info(`[${resp.status}] ${resp.statusText}`)
  }
}

release()

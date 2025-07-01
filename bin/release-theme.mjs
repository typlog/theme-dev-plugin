#!/usr/bin/env node

import { loadThemeData, updateTemplatesContext, submitTheme } from "@typlog/theme-dev-plugin"

async function release () {
  const theme = await loadThemeData(process.cwd())
  // use jsdelivr to host static files from GitHub
  const staticURL = `https://cdn.jsdelivr.net/gh/${theme.repo}@${theme.version}/static`
  updateTemplatesContext(theme.templates, {_static_url: staticURL})
  const resp = await submitTheme(theme, process.env.THEME_SUBMIT_TOKEN)
  if (resp.status >= 400) {
    const result = await resp.json()
    console.error(`[${resp.status}] ${resp.statusText}`)
    console.info(JSON.stringify(result, null, 2))
    process.exit(1)
  } else if (resp.status < 300) {
    console.info(`[${resp.status}] ${resp.statusText}`)
  }
}

release()

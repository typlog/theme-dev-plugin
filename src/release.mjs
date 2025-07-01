import fetch from "node-fetch"
import { readdir, readFile } from "fs/promises"

const API_URL = process.env.THEME_SUBMIT_API || 'https://api.typlog.com/v4/theme/submit'

export async function submitTheme (theme, token) {
  const readme = await findReadme()
  const body = JSON.stringify({...theme, readme})
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body,
  })
  return resp
}

async function findReadme () {
  const names = await readdir(process.cwd())
  for (let name of names) {
    if (/readme\./i.test(name)) {
      return readFile(name, {encoding: 'utf-8'})
    }
  }
  return ''
}

import fetch from "node-fetch"
import { readdir, readFile } from "fs/promises"


export async function submitTheme (url, token, theme) {
  const readme = await findReadme()
  const body = JSON.stringify({...theme, readme})
  const resp = await fetch(url, {
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

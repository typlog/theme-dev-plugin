import fetch from "node-fetch"

const API_URL = process.env.THEME_SUBMIT_API || 'https://api.typlog.com/v4/theme/submit'

export async function submitTheme (theme, token) {
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(theme),
  })
  return resp.json()
}

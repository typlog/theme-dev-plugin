import { resolve } from "path"
import { readFile } from "fs/promises"
import { resolveTemplates } from "./templates"


export interface ThemeData {
  name: string;
  version: string;
  templates: Record<string, string>;
  messages?: Record<string, string>;
  variables?: Record<string, any>;
  context?: Record<string, any>;
  [key: string]: unknown;
}


export async function parseThemeData (root: string = "."): Promise<ThemeData> {
  const themeData = await readFile(resolve(root, "theme.json"), { encoding: "utf-8" })
  const theme = JSON.parse(themeData)
  const templates = await resolveTemplates(resolve(root, "templates"))

  if (theme.context) {
    const updateContext = (content: string) => {
      Object.keys(theme.context).forEach(key => {
        const reVar = new RegExp('\\{\\{\\s*' + key + '\\s*\\}\\}', 'g')
        content = content.replace(reVar, theme.context[key])
      })
      return content
    }
    Object.keys(templates).forEach(key => {
      if (/^_/.test(key)) {
        templates[key] = updateContext(templates[key])
      }
    })
  }
  return { ...theme, templates }
}

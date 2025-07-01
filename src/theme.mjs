import { resolve } from "path"
import { readFile } from "fs/promises"
import { resolveTemplates, updateTemplatesContext } from "./templates.mjs"

/**
 * @typedef ThemeData
 * @prop {string} name
 * @prop {string} version
 * @prop {string} repo
 * @prop {Record<string, string>} templates
 * @prop {Record<string, string>} [messages]
 * @prop {Record<string, any>[]} [config]
 * @prop {Record<string, any>} [context]
 */

/**
 *
 * @param {string} root
 * @returns {Promise<ThemeData>}
 */
export async function parseThemeData (root = ".") {
  const theme = await loadThemeData(root)
  if (theme.context) {
    updateTemplatesContext(theme.templates, theme.context)
  }
  return theme
}

/**
 *
 * @param {string} root
 * @returns {Promise<ThemeData>}
 */
export async function loadThemeData (root = ".") {
  const themeData = await readFile(resolve(root, "theme.json"), { encoding: "utf-8" })
  const theme = JSON.parse(themeData)
  const templates = await resolveTemplates(resolve(root, "templates"))
  return { ...theme, templates }
}

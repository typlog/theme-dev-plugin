import { resolve, dirname } from "path"
import { readdir, readFile, lstat } from "fs/promises"

const reInclude = new RegExp('{%-?\\s+include\\s+("|\')(\\./\\S+?)\\1\\s+-?%}', 'g')


/**
 *
 * @param {string} folder
 * @returns {Promise<Record<string, string>>}
 */
export async function resolveTemplates (folder) {
  /** @type {Record<string, string>} */
  const _cached = {}

  const loadTemplates = async (baseDir) => {
    const names = await readdir(baseDir)

    await Promise.all(names.map(async (name) => {
      const filepath = resolve(baseDir, name)
      const stat = await lstat(filepath)
      if (stat.isFile()) {
        const content = await readFile(filepath, { encoding: 'utf-8' })
        _cached[filepath] = content
      } else if (stat.isDirectory()) {
        await loadTemplates(filepath)
      }
    }))
  }

  const resolveIncludes = (filepath) => {
    let content = _cached[filepath]
    if (content === undefined) {
      const filename = filepath.replace(resolve(folder) + '/', '')
      throw new Error(`Template "${filename}" does not exist`)
    }
    const found = content.match(reInclude)
    if (found) {
      found.forEach(str => {
        const name = str.replace(/^{%-?\s+include\s+("|')/, '').replace(/("|')\s+-?%}$/, '')
        content = content.replace(str, resolveIncludes(resolve(dirname(filepath), name)))
      })
    }
    return content.trim()
  }

  await loadTemplates(folder)

  /** @type {Record<string, string>} */
  const templates = {}
  Object.keys(_cached).forEach(filepath => {
    const name = filepath.replace(resolve(folder) + '/', '')
    // exclude files whose name startswith _
    // exclude files in subfolder
    if (/\.j2$/.test(name) && !/^[_.]/.test(name) && !/\//.test(name)) {
      templates[name] = resolveIncludes(filepath)
    }
  })
  return templates
}

/**
 *
 * @param {Record<string, string>} templates
 * @param {Record<string, string>} context
 * @returns {Record<string, string>}
 */
export function updateTemplatesContext (templates, context) {

  /** @param {string} content */
  const updateContext = (content) => {
    Object.keys(context).forEach(key => {
      if (/^_/.test(key)) {
        const reVar = new RegExp('\\{\\{\\s*' + key + '\\s*\\}\\}', 'g')
        content = content.replace(reVar, context[key])
      }
    })
    return content
  }

  Object.keys(templates).forEach(key => {
    templates[key] = updateContext(templates[key])
  })
  return templates
}

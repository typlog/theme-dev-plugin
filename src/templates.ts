import { resolve, dirname } from "path"
import { readdir, readFile, lstat } from "fs/promises"

const reInclude = new RegExp('{%\\s+include\\s+("|\')(\\./\\S+?)\\1\\s+%}', 'g')


export async function resolveTemplates (folder: string): Promise<Record<string, string>> {
  const _cached: Record<string, string> = {}

  const loadTemplates = async (baseDir: string) => {
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

  const resolveIncludes = (filepath: string) => {
    let content = _cached[filepath]
    const found = content.match(reInclude)
    if (found) {
      found.forEach(str => {
        const name = str.replace(/^{%\s+include\s+("|')/, '').replace(/("|')\s+%}$/, '')
        content = content.replace(str, resolveIncludes(resolve(dirname(filepath), name)))
      })
    }
    return content.trim()
  }

  await loadTemplates(folder)

  const templates: Record<string, string> = {}
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

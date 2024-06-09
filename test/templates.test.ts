import { resolve } from 'path'
import { readFile, readdir } from 'fs/promises'
import { expect, test, describe } from 'vitest'
import { resolveTemplates } from "../src"

describe('resolveTemplates', async () => {
  const fixtures = resolve(import.meta.dirname, 'fixtures')
  const names = await readdir(fixtures)

  names.forEach(name => {
    if (/^templates-\d/.test(name)) {
      test(name, async () => {
        const folder = resolve(fixtures, name)
        const outputContent = await readFile(`${folder}/expect.json`, { encoding: "utf-8" })
        const output = JSON.parse(outputContent)
        const templates = await resolveTemplates(folder)
        expect(templates).toEqual(output)
      })
    }
  })
})

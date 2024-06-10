import { resolve } from 'path'
import { readFile, readdir } from 'fs/promises'
import { expect, test, describe } from 'vitest'
import { parseThemeData } from "../src/index.mjs"

describe('parseThemeData', async () => {
  const fixtures = resolve(import.meta.dirname, 'fixtures')
  const names = await readdir(fixtures)

  names.forEach(name => {
    if (/^theme-\d/.test(name)) {
      test(name, async () => {
        const folder = resolve(fixtures, name)
        const outputContent = await readFile(`${folder}/expect.json`, { encoding: "utf-8" })
        const output = JSON.parse(outputContent)
        const theme = await parseThemeData(folder)
        expect(theme).toEqual(output)
      })
    }
  })
})

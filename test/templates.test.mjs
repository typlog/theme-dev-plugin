import { resolve } from 'path'
import { readFile, readdir } from 'fs/promises'
import { expect, test, describe } from 'vitest'
import { resolveTemplates, updateTemplatesContext } from "../src/index.mjs"

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

describe('updateTemplatesContext', () => {
  test('update without context', () => {
    const result = updateTemplatesContext({'a.j2': '{{ _url }}'}, {})
    expect(result).toEqual({'a.j2': '{{ _url }}'})
  })

  test('update underscore context', () => {
    const result = updateTemplatesContext({'a.j2': '{{ _url }}'}, {_url: 'a'})
    expect(result).toEqual({'a.j2': 'a'})
  })

  test('will not update context', () => {
    const result = updateTemplatesContext({'a.j2': '{{ url }}'}, {url: 'a'})
    expect(result).toEqual({'a.j2': '{{ url }}'})
  })

  test('update all underscore context', () => {
    const result = updateTemplatesContext({'a.j2': '{{ _url }}\n{{ _url }}'}, {_url: 'a'})
    expect(result).toEqual({'a.j2': 'a\na'})
  })
})

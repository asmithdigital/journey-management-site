#!/usr/bin/env node
// Reads the most recent git commit message, parses [journey:Name] description,
// and appends a changelog entry to the matching journey JSON file.

import { execSync } from 'child_process'
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const journeysDir = join(root, 'public', 'data', 'journeys')

function getCommitMessage() {
  try {
    return execSync('git log -1 --pretty=%B', { cwd: root }).toString().trim()
  } catch {
    return ''
  }
}

function inferType(message) {
  const lower = message.toLowerCase()
  if (/\b(add|added|adds|new)\b/.test(lower)) return 'added'
  if (/\b(fix|fixed|fixes|bug)\b/.test(lower)) return 'fixed'
  return 'changed'
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function findJourneyFile(journeyName) {
  const files = readdirSync(journeysDir).filter(f => f.endsWith('.json'))
  for (const file of files) {
    const filePath = join(journeysDir, file)
    try {
      const data = JSON.parse(readFileSync(filePath, 'utf8'))
      if (data.name && data.name.toLowerCase() === journeyName.toLowerCase()) {
        return { filePath, data }
      }
    } catch {
      // skip malformed files
    }
  }
  // Fallback: try slug match
  const slug = slugify(journeyName)
  const candidate = join(journeysDir, `${slug}.json`)
  try {
    const data = JSON.parse(readFileSync(candidate, 'utf8'))
    return { filePath: candidate, data }
  } catch {
    return null
  }
}

const commitMessage = getCommitMessage()
if (!commitMessage) {
  process.exit(0)
}

// Match pattern: [journey:Journey Name] description text
const match = commitMessage.match(/\[journey:([^\]]+)\]\s*(.+)/s)
if (!match) {
  process.exit(0)
}

const journeyName = match[1].trim()
const description = match[2].trim().split('\n')[0].trim()
const type = inferType(commitMessage)

const result = findJourneyFile(journeyName)
if (!result) {
  console.error(`update-changelog: no journey file found for "${journeyName}"`)
  process.exit(0)
}

const { filePath, data } = result
if (!Array.isArray(data.changelog)) {
  data.changelog = []
}

data.changelog.unshift({ date: today(), type, description })

writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n')
execSync(`git add "${filePath}"`, { cwd: root })
console.log(`update-changelog: appended ${type} entry to ${filePath}`)

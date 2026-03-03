import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

type DopplerProject = {
  id?: string
  name: string
}

type DopplerConfig = {
  name: string
  environment?: string
}

type ExportedConfig = {
  environment: string | null
  keyCount: number
  keys: string[]
}

type ExportedProject = {
  configCount: number
  configs: Record<string, ExportedConfig>
}

const PAGE_SIZE = 100
const OUTPUT_PATH = path.join(os.homedir(), 'Downloads', 'doppler-keys-export.json')

function runDoppler(args: string[]) {
  return execFileSync('doppler', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

function listAllProjects(): DopplerProject[] {
  const projects: DopplerProject[] = []

  for (let page = 1; ; page += 1) {
    console.log(`Fetching Doppler projects page ${page}...`)
    const raw = runDoppler(['projects', '--json', '--number', String(PAGE_SIZE), '--page', String(page)])
    const batch = JSON.parse(raw) as DopplerProject[]

    projects.push(...batch)

    if (batch.length < PAGE_SIZE) {
      break
    }
  }

  return projects
}

function listAllConfigs(project: string): DopplerConfig[] {
  const configs: DopplerConfig[] = []

  for (let page = 1; ; page += 1) {
    console.log(`  Fetching configs for ${project} (page ${page})...`)
    const raw = runDoppler([
      'configs',
      '--project',
      project,
      '--json',
      '--number',
      String(PAGE_SIZE),
      '--page',
      String(page),
    ])
    const batch = JSON.parse(raw) as DopplerConfig[]

    configs.push(...batch)

    if (batch.length < PAGE_SIZE) {
      break
    }
  }

  return configs
}

function listSecretNames(project: string, config: string): string[] {
  const raw = runDoppler([
    'secrets',
    '--project',
    project,
    '--config',
    config,
    '--only-names',
    '--json',
  ])
  const parsed = JSON.parse(raw) as Record<string, unknown>

  return Object.keys(parsed).sort((a, b) => a.localeCompare(b))
}

async function main() {
  console.log('Starting Doppler key inventory export...')
  const projects = listAllProjects()
  const exportedProjects: Record<string, ExportedProject> = {}
  const errors: string[] = []
  const sortedProjects = projects.sort((a, b) => a.name.localeCompare(b.name))

  console.log(`Found ${sortedProjects.length} project(s).`)

  for (const [projectIndex, project] of sortedProjects.entries()) {
    try {
      console.log(`[${projectIndex + 1}/${sortedProjects.length}] Exporting project ${project.name}...`)
      const configs = listAllConfigs(project.name)
      const exportedConfigs: Record<string, ExportedConfig> = {}
      const sortedConfigs = configs.sort((a, b) => a.name.localeCompare(b.name))

      console.log(`  Found ${sortedConfigs.length} config(s) in ${project.name}.`)

      for (const [configIndex, config] of sortedConfigs.entries()) {
        try {
          console.log(`    [${configIndex + 1}/${sortedConfigs.length}] Exporting ${project.name}/${config.name}...`)
          const keys = listSecretNames(project.name, config.name)

          exportedConfigs[config.name] = {
            environment: config.environment ?? null,
            keyCount: keys.length,
            keys,
          }
        } catch (error: any) {
          console.warn(`    Failed to export ${project.name}/${config.name}`)
          errors.push(
            `Failed to export keys for ${project.name}/${config.name}: ${error.stderr?.toString?.().trim() || error.message}`
          )
        }
      }

      exportedProjects[project.name] = {
        configCount: Object.keys(exportedConfigs).length,
        configs: exportedConfigs,
      }
    } catch (error: any) {
      console.warn(`  Failed to list configs for ${project.name}`)
      errors.push(
        `Failed to list configs for ${project.name}: ${error.stderr?.toString?.().trim() || error.message}`
      )
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    outputType: 'doppler-secret-key-inventory',
    includesSecretValues: false,
    projectCount: Object.keys(exportedProjects).length,
    projects: exportedProjects,
    errors,
  }

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

  console.log(`Wrote Doppler key inventory to ${OUTPUT_PATH}`)
  if (errors.length > 0) {
    console.warn(`Completed with ${errors.length} warning(s). See the "errors" array in the JSON output.`)
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})

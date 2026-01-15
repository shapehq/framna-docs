import { Command } from "commander"
import chalk from "chalk"
import ora from "ora"
import { clearCache, getCacheStats } from "../cache/index.js"

export function createCacheCommand(): Command {
  const cache = new Command("cache").description("Manage local cache")

  cache.command("clear").description("Clear all cached data").action(async () => {
    const spinner = ora("Clearing cache...").start()
    try {
      const { cleared } = await clearCache()
      spinner.stop()
      if (cleared.length === 0) {
        console.log(chalk.yellow("Cache was already empty"))
      } else {
        console.log(chalk.green(`Cleared ${cleared.length} cached items`))
      }
    } catch (error) {
      spinner.fail("Failed to clear cache")
      console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"))
      process.exit(1)
    }
  })

  cache.command("status").description("Show cache status").action(async () => {
    try {
      const stats = await getCacheStats()
      console.log(chalk.bold("Cache Status:"))
      console.log(`  Projects cached: ${stats.projectsCached ? "yes" : "no"}`)
      if (stats.projectsCached && stats.projectsAge !== undefined) {
        const ageSeconds = Math.floor(stats.projectsAge / 1000)
        const ttlRemaining = Math.max(0, 60 - ageSeconds)
        console.log(chalk.dim(`    Age: ${ageSeconds}s (expires in ${ttlRemaining}s)`))
      }
      console.log(`  Specs cached: ${stats.specsCount}`)
      console.log(`  Total size: ${(stats.totalSizeBytes / 1024).toFixed(1)} KB`)
      console.log()
      console.log(chalk.dim("Cache location: ~/.framna-docs/cache/"))
    } catch (error) {
      console.error(chalk.red(error instanceof Error ? error.message : "Unknown error"))
      process.exit(1)
    }
  })

  return cache
}

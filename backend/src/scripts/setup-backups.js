import schedule from "node-schedule"
import backupService from "../services/backupService.js"
import monitoringService from "../services/monitoringService.js"

// Schedule automatic backups
export function scheduleBackups() {
  // Full backup daily at 2 AM
  schedule.scheduleJob("0 2 * * *", async () => {
    try {
      console.log("[SCHEDULER] Running daily full backup")
      const result = await backupService.createFullBackup()

      await monitoringService.recordMetric("backup_success", 1)
      console.log("[SCHEDULER] Backup successful:", result)
    } catch (error) {
      console.error("[SCHEDULER] Backup failed:", error)

      await monitoringService.sendAlert({
        type: "BACKUP_FAILED",
        severity: "critical",
        message: `Daily backup failed: ${error.message}`,
      })
    }
  })

  // Incremental backup every 6 hours
  schedule.scheduleJob("0 */6 * * *", async () => {
    try {
      console.log("[SCHEDULER] Running incremental backup")
      const result = await backupService.createIncrementalBackup()
      console.log("[SCHEDULER] Incremental backup successful:", result)
    } catch (error) {
      console.error("[SCHEDULER] Incremental backup failed:", error)
    }
  })

  // Verify backups daily at 3 AM
  schedule.scheduleJob("0 3 * * *", async () => {
    try {
      console.log("[SCHEDULER] Verifying backups")
      const backups = await backupService.listBackups()

      for (const backup of backups.slice(0, 5)) {
        const verification = await backupService.verifyBackup(backup.name)
        console.log(`[SCHEDULER] Backup verification: ${backup.name} - ${verification.valid}`)
      }
    } catch (error) {
      console.error("[SCHEDULER] Verification failed:", error)
    }
  })

  // Clean old backups weekly
  schedule.scheduleJob("0 4 0 * * *", async () => {
    try {
      console.log("[SCHEDULER] Cleaning old backups")
      const result = await backupService.cleanOldBackups()
      console.log("[SCHEDULER] Cleanup completed:", result)
    } catch (error) {
      console.error("[SCHEDULER] Cleanup failed:", error)
    }
  })

  console.log("[SCHEDULER] Backup schedules configured")
}

export default scheduleBackups

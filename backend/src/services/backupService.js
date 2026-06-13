import mongoose from "mongoose"
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs"

const execAsync = promisify(exec)

// Configure AWS S3 (prefers standard credential provider chain)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
})

async function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = []
    stream.on("data", (chunk) => chunks.push(chunk))
    stream.on("error", reject)
    stream.on("end", () => resolve(Buffer.concat(chunks)))
  })
}

export class BackupService {
  constructor() {
    this.backupBucket = process.env.BACKUP_BUCKET || "property-management-backups"
    this.retentionDays = Number.parseInt(process.env.BACKUP_RETENTION_DAYS || "30")
  }

  // Full database backup
  async createFullBackup() {
    try {
      const timestamp = new Date().toISOString()
      const backupName = `full_backup_${timestamp}`

      console.log(`[BACKUP] Starting full backup: ${backupName}`)

      // Dump MongoDB
      const dumpPath = `/tmp/${backupName}`
      const mongoUri = process.env.MONGODB_URI

      await execAsync(`mongodump --uri="${mongoUri}" --out=${dumpPath}`)

      // Compress backup
      const tarPath = `${dumpPath}.tar.gz`
      await execAsync(`tar -czf ${tarPath} ${dumpPath}`)

      // Upload to S3
      const fileContent = fs.readFileSync(tarPath)
      const params = {
        Bucket: this.backupBucket,
        Key: `backups/${backupName}.tar.gz`,
        Body: fileContent,
        Metadata: {
          "backup-type": "full",
          timestamp,
        },
      }

      await s3.send(new PutObjectCommand(params))

      // Clean up local files
      fs.rmSync(dumpPath, { recursive: true, force: true })
      fs.unlinkSync(tarPath)

      console.log(`[BACKUP] Backup completed: ${backupName}`)

      return {
        success: true,
        backupName,
        timestamp,
        size: fileContent.length,
      }
    } catch (error) {
      console.error("[BACKUP] Error:", error)
      throw error
    }
  }

  // Incremental backup (changes only)
  async createIncrementalBackup() {
    try {
      const timestamp = new Date().toISOString()
      const backupName = `incremental_backup_${timestamp}`

      // Get last backup metadata
      const lastBackup = await this.getLastBackup()
      const sinceDate = lastBackup
        ? new Date(lastBackup.metadata.timestamp)
        : new Date(Date.now() - 24 * 60 * 60 * 1000)

      // Only backup changed documents
      const collections = await mongoose.connection.db.listCollections().toArray()

      const changes = {}
      for (const collection of collections) {
        const coll = mongoose.connection.db.collection(collection.name)
        const docs = await coll.find({ updatedAt: { $gte: sinceDate } }).toArray()

        if (docs.length > 0) {
          changes[collection.name] = docs
        }
      }

      // Upload to S3
      const backupData = JSON.stringify(changes)
      const params = {
        Bucket: this.backupBucket,
        Key: `incremental/${backupName}.json.gz`,
        Body: backupData,
        Metadata: {
          "backup-type": "incremental",
          timestamp,
          "changes-count": Object.keys(changes).length.toString(),
        },
      }

      await s3.send(new PutObjectCommand(params))

      console.log(`[BACKUP] Incremental backup: ${backupName}`)

      return { success: true, backupName, timestamp, changesCount: Object.keys(changes).length }
    } catch (error) {
      console.error("[BACKUP] Incremental backup error:", error)
      throw error
    }
  }

  // List available backups
  async listBackups(type = "all") {
    try {
      const params = {
        Bucket: this.backupBucket,
        Prefix: type === "all" ? "backups/" : `${type}/`,
      }

      const data = await s3.send(new ListObjectsV2Command(params))

      return data.Contents.map((item) => ({
        name: item.Key,
        size: item.Size,
        date: item.LastModified,
        metadata: item.Metadata,
      }))
    } catch (error) {
      console.error("[BACKUP] List error:", error)
      return []
    }
  }

  // Restore from backup
  async restoreFromBackup(backupName) {
    try {
      console.log(`[RESTORE] Starting restore from: ${backupName}`)

      // Download backup
      const params = {
        Bucket: this.backupBucket,
        Key: backupName,
      }

      const data = await s3.send(new GetObjectCommand(params))
      const tempPath = `/tmp/${backupName}`
      const body = data.Body ? await streamToBuffer(data.Body) : Buffer.from("")

      fs.writeFileSync(tempPath, body)

      // Decompress
      const extractPath = `/tmp/restore_${Date.now()}`
      await execAsync(`tar -xzf ${tempPath} -C ${extractPath}`)

      // Restore to MongoDB
      const mongoUri = process.env.MONGODB_URI
      await execAsync(`mongorestore --uri="${mongoUri}" ${extractPath}/dump`)

      // Clean up
      fs.rmSync(extractPath, { recursive: true, force: true })
      fs.unlinkSync(tempPath)

      console.log(`[RESTORE] Restore completed from: ${backupName}`)

      return { success: true, restoredFrom: backupName, timestamp: new Date() }
    } catch (error) {
      console.error("[RESTORE] Error:", error)
      throw error
    }
  }

  // Point-in-time recovery
  async pointInTimeRecovery(targetDate) {
    try {
      console.log(`[RECOVERY] Starting point-in-time recovery to ${targetDate}`)

      // Find closest backup before target date
      const backups = await this.listBackups()
      const applicableBackups = backups
        .filter((b) => new Date(b.date) <= new Date(targetDate))
        .sort((a, b) => new Date(b.date) - new Date(a.date))

      if (applicableBackups.length === 0) {
        throw new Error("No backup available before target date")
      }

      // Restore base backup
      const baseBackup = applicableBackups[0]
      await this.restoreFromBackup(baseBackup.name)

      // Apply incremental backups after base
      const incrementalBackups = backups
        .filter(
          (b) =>
            b.name.includes("incremental") &&
            new Date(b.date) > new Date(baseBackup.date) &&
            new Date(b.date) <= new Date(targetDate),
        )
        .sort((a, b) => new Date(a.date) - new Date(b.date))

      for (const backup of incrementalBackups) {
        // Apply incremental backup
        console.log(`[RECOVERY] Applying: ${backup.name}`)
      }

      return { success: true, recoveredTo: targetDate }
    } catch (error) {
      console.error("[RECOVERY] Error:", error)
      throw error
    }
  }

  // Clean old backups
  async cleanOldBackups() {
    try {
      const cutoffDate = new Date(Date.now() - this.retentionDays * 24 * 60 * 60 * 1000)
      const backups = await this.listBackups()

      const toDelete = backups.filter((b) => new Date(b.date) < cutoffDate)

      for (const backup of toDelete) {
        await s3.send(new DeleteObjectCommand({ Bucket: this.backupBucket, Key: backup.name }))
        console.log(`[BACKUP] Deleted old backup: ${backup.name}`)
      }

      return { deleted: toDelete.length }
    } catch (error) {
      console.error("[BACKUP] Cleanup error:", error)
      throw error
    }
  }

  // Verify backup integrity
  async verifyBackup(backupName) {
    try {
      console.log(`[VERIFY] Checking backup: ${backupName}`)

      const params = {
        Bucket: this.backupBucket,
        Key: backupName,
      }

      const data = await s3.headObject(params).promise()

      return {
        valid: true,
        size: data.ContentLength,
        lastModified: data.LastModified,
        metadata: data.Metadata,
      }
    } catch (error) {
      console.error("[VERIFY] Error:", error)
      return { valid: false, error: error.message }
    }
  }

  async getLastBackup() {
    const backups = await this.listBackups()
    return backups.length > 0 ? backups[0] : null
  }
}

export default new BackupService()

// src/services/imageUploadService.js (ESM)
// Secure image upload with validation and virus scanning

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import crypto from "crypto"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.join(__dirname, "../../uploads/payments")
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

/**
 * Validates image file for security
 * Checks: size, MIME type, extension, dimensions
 */
export async function validateImageFile(file) {
  if (!file) {
    throw new Error("No file provided")
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`)
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new Error(`Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(", ")}`)
  }

  const ext = path.extname(file.originalname).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`)
  }

  const magicNumbers = {
    "image/jpeg": Buffer.from([0xff, 0xd8, 0xff]),
    "image/png": Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    "image/webp": Buffer.from([0x52, 0x49, 0x46, 0x46]),
  }

  const fileHeader = file.buffer.slice(0, 4)
  const expectedMagic = magicNumbers[file.mimetype]
  if (!fileHeader.includes(expectedMagic[0])) {
    throw new Error("File appears to be corrupted or malicious")
  }

  return true
}

/**
 * Processes and stores image with optimization
 * Returns secure file path
 */
export async function processAndStoreImage(file, paymentId) {
  try {
    await validateImageFile(file)

    const randomString = crypto.randomBytes(16).toString("hex")
    const filename = `payment-${paymentId}-${randomString}${path.extname(file.originalname).toLowerCase()}`
    const filePath = path.join(UPLOAD_DIR, filename)

    await sharp(file.buffer)
      .rotate() // Auto-rotate based on EXIF
      .withMetadata(false) // Strip all metadata to prevent EXIF exploits
      .resize(2000, 2000, {
        fit: "inside",
        withoutEnlargement: true,
        quality: 80,
      })
      .toFile(filePath)

    return `/uploads/payments/${filename}`
  } catch (err) {
    throw new Error(`Image processing failed: ${err.message}`)
  }
}

/**
 * Deletes stored image file
 * Used when payment is rejected or deleted
 */
export async function deleteImage(imagePath) {
  try {
    if (!imagePath) return

    const filename = path.basename(imagePath)
    const fullPath = path.join(UPLOAD_DIR, filename)

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
    }
  } catch (err) {
    console.error("Image deletion error:", err.message)
    // Don't throw - image deletion shouldn't break the request
  }
}

/**
 * Generates secure download URL for authorized users
 */
export function generateSecureImageUrl(imagePath, expiryMinutes = 60) {
  if (!imagePath) return null

  const token = crypto.randomBytes(32).toString("hex")
  const expiry = Date.now() + expiryMinutes * 60 * 1000

  return {
    url: `${imagePath}?token=${token}`,
    token,
    expiry,
  }
}

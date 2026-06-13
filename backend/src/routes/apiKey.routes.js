import { Router } from "express"
import { auth } from "../middleware/auth-advanced.js"
import {
  validateCreateApiKey,
  validateListApiKeys,
  validateRevokeApiKey,
} from "../middleware/validators.js"
import { createApiKey, listApiKeys, revokeApiKey } from "../controllers/apiKeyController.js"

const router = Router()

router.post("/", auth(["PM", "ADMIN", "FS"]), validateCreateApiKey, createApiKey)
router.get("/", auth(["PM", "ADMIN", "FS"]), validateListApiKeys, listApiKeys)
router.patch("/:id/revoke", auth(["PM", "ADMIN", "FS"]), validateRevokeApiKey, revokeApiKey)

export default router

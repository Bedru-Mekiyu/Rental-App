import { Router } from "express"
import { auth } from "../middleware/auth-advanced.js"
import {
	validateCreateUnit,
	validateUpdateUnit,
	validateListUnits,
	validateObjectIdParam,
} from "../middleware/validators.js"
import { createUnit, listUnits, getUnitById, updateUnit, deleteUnit } from "../controllers/unitController.js"

const router = Router()

router.post("/", auth(["PM", "ADMIN"]), validateCreateUnit, createUnit)
router.get("/", auth(), validateListUnits, listUnits)
router.get("/:id", auth(), validateObjectIdParam("id", "unit ID"), getUnitById)
router.patch("/:id", auth(["PM", "ADMIN"]), validateObjectIdParam("id", "unit ID"), validateUpdateUnit, updateUnit)
router.delete("/:id", auth(["PM", "ADMIN"]), validateObjectIdParam("id", "unit ID"), deleteUnit)

export default router

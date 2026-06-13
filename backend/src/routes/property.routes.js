import { Router } from "express"
import { auth } from "../middleware/auth-advanced.js"
import {
  validatePagination,
  validateObjectIdParam,
  validateCreateProperty,
  validateUpdateProperty,
} from "../middleware/validators.js"
import {
  createProperty,
  listProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} from "../controllers/propertyController.js"

const router = Router()

router.post("/", auth(["PM", "ADMIN"]), validateCreateProperty, createProperty)
router.get("/", auth(), validatePagination, listProperties)
router.get("/:id", auth(), validateObjectIdParam("id", "property ID"), getPropertyById)
router.patch(
  "/:id",
  auth(["PM", "ADMIN"]),
  validateUpdateProperty,
  updateProperty,
)
router.delete("/:id", auth(["PM", "ADMIN"]), validateObjectIdParam("id", "property ID"), deleteProperty)

export default router

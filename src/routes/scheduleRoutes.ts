import { Router } from "express";
import { scheduleController } from "../controllers/scheduleController.js";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { scheduleInputSchema } from "../schemas/schedule.js";

export const scheduleRoutes = Router();
scheduleRoutes.use(requireAuth);
scheduleRoutes.get("/", scheduleController.list);
scheduleRoutes.post("/", validateBody(scheduleInputSchema), scheduleController.create);
scheduleRoutes.put("/:id", validateBody(scheduleInputSchema), scheduleController.update);
scheduleRoutes.delete("/:id", scheduleController.delete);

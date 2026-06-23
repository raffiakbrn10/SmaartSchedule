import { Router } from "express";
import { scheduleController } from "../controllers/scheduleController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { scheduleInputSchema } from "../schemas/schedule";

export const scheduleRoutes = Router();
scheduleRoutes.use(requireAuth);
scheduleRoutes.get("/", scheduleController.list);
scheduleRoutes.post("/", validateBody(scheduleInputSchema), scheduleController.create);
scheduleRoutes.put("/:id", validateBody(scheduleInputSchema), scheduleController.update);
scheduleRoutes.delete("/:id", scheduleController.delete);




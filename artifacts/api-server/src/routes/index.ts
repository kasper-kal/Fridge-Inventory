import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import aiRouter from "./ai";
import householdsRouter from "./households";
import usersRouter from "./users";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/products", productsRouter);
router.use("/ai", aiRouter);
router.use("/households", householdsRouter);
router.use("/users", usersRouter);
router.use("/settings", settingsRouter);

export default router;

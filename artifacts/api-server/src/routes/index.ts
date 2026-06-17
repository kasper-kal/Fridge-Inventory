import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import aiRouter from "./ai";
import householdsRouter from "./households";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/products", productsRouter);
router.use("/ai", aiRouter);
router.use("/households", householdsRouter);

export default router;

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import pinataRouter from "./pinata";

const router: IRouter = Router();

router.use(healthRouter);
router.use(pinataRouter);

export default router;

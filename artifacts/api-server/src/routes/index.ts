import { Router, type IRouter } from "express";
import healthRouter from "./health";
import videosRouter from "./videos";
import categoriesRouter from "./categories";
import searchRouter from "./search";
import authRouter from "./auth";
import userRouter from "./user";
import adminRouter from "./admin";
import performersRouter from "./performers";
import pfRouter from "./pf";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/videos", videosRouter);
router.use("/categories", categoriesRouter);
router.use("/search", searchRouter);
router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/admin", adminRouter);
router.use("/performers", performersRouter);
router.use("/studios", performersRouter);
router.use("/pf", pfRouter);

export default router;

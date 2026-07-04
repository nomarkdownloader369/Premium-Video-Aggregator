import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { initDb } from "./db/index";
import { seedCategories, seedAdminUser } from "./db/seed";
import { startScraperDaemon } from "./lib/scraper";

// Initialize SQLite (PureX)
initDb();
seedCategories();
seedAdminUser();

// Start PervFlix scraper daemon (runs every 3h, first run after 30s)
if (process.env["DATABASE_URL"]) {
  startScraperDaemon();
} else {
  logger.warn("DATABASE_URL not set — PervFlix scraper daemon not started");
}

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;

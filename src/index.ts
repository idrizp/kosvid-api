import { config } from "dotenv";
import * as cors from "cors";
import * as helmet from "helmet";
config();

import * as express from "express";
import {
	DailyStatistics,
	MonthlyStatistics,
	WeeklyStatistics,
} from "./controller/statistics_controller";
import StatisticsManager from "./manager/statistics_manager";

(async () => {
	const statisticsManager = new StatisticsManager();

	const app = express();

	app.use(cors())
		.use(express.json())
		.use(express.urlencoded({ extended: true }))
		.use(helmet());

	app.get("/api/daily", DailyStatistics(statisticsManager))
		.get("/api/weekly", WeeklyStatistics(statisticsManager))
		.get("/api/monthly", MonthlyStatistics(statisticsManager));

	app.listen(process.env.PORT, () =>
		console.log(`Listening to port ${process.env.PORT}`),
	);
})();

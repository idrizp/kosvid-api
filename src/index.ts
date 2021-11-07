import { config } from "dotenv";
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

	app.use(express.json()).use(express.urlencoded({ extended: true }));
	app.get("/api/daily", DailyStatistics(statisticsManager))
		.get("/api/weekly", WeeklyStatistics(statisticsManager))
		.get("/api/monthly", MonthlyStatistics(statisticsManager));

	app.listen(process.env.PORT, () =>
		console.log(`Listening to port ${process.env.PORT}`),
	);
})();

import { Request, Response } from "express";
import StatisticsManager from "../manager/statistics_manager";

export function DailyStatistics(statisticsManager: StatisticsManager) {
	return async (request: Request, response: Response) => {
		response.status(200).json(await statisticsManager.getDailyData());
	};
}

export function WeeklyStatistics(statisticsManager: StatisticsManager) {
	return async (request: Request, response: Response) => {
		response.status(200).json(await statisticsManager.getWeeklyData());
	};
}

export function MonthlyStatistics(statisticsManager: StatisticsManager) {
	return async (request: Request, response: Response) => {
		response.status(200).json(await statisticsManager.getMonthlyData());
	};
}

import axios, { AxiosResponse } from "axios";
import * as parse from "csv-parse";
import { Moment } from "moment";
import * as moment from "moment";
import { Statistic } from "../model/statistics";

const url: string =
	"https://github.com/owid/covid-19-data/blob/master/public/data/owid-covid-data.csv?raw=true";

/**
 * Parses a number, since we're working with CSVs, in case this is empty, we return a 0.
 * @param input The input string.
 * @returns The number that is parsed.
 */
const parseNumber = (input: string): number => {
	return input.trim().length === 0 ? 0 : Number(input);
};

/**
 * Manages the statistics.
 */
export default class StatisticsManager {
	private statistics: Statistic[] = [];

	constructor() {
		/**
		 * Schedules an update task to run every day.
		 */
		const runUpdateTask = () => {
			this.updateData();
			setTimeout(runUpdateTask, 1000 * 60 * 60 * 24);
		};
		runUpdateTask();
	}

	/**
	 * Returns the data in between the range.
	 * @param start The start date, inclusive.
	 * @param end The end date, inclusive.
	 * @returns An array containing the statistics in between the range.
	 */
	async getDataInRange(
		start: Moment,
		end: Moment = moment(),
	): Promise<Statistic[]> {
		const result: Statistic[] = [];

		// Make these inclusive.
		end.add(1, "days");
		start.subtract(1, "days");

		while (start.isBefore(end)) {
			start.add(1, "days");
			const dayOfYear = start.dayOfYear();
			if (this.statistics.length <= dayOfYear) {
				return result;
			}
			result.push(this.statistics[dayOfYear]);
		}
		return result;
	}

	/**
	 * Returns the daily data.
	 * @returns The daily data.
	 */
	async getDailyData() {
		return this.statistics[this.statistics.length - 1];
	}

	/**
	 * Returns the weekly data.
	 * @returns The weekly data.
	 */
	async getWeeklyData() {
		return this.getDataInRange(moment().subtract(1, "week"));
	}

	/**
	 * The monthly data.
	 * @returns The monthly data.
	 */
	async getMonthlyData() {
		return this.getDataInRange(moment().subtract(1, "month"));
	}

	/**
	 * Updates the data.
	 * It will download the data from OWID(https://ourworldindata.com)'s github repository for COVID data.
	 */
	async updateData() {
		console.log("Starting to update data...");
		const result = await axios.get<
			{},
			AxiosResponse<NodeJS.ReadableStream>
		>(url, { responseType: "stream" });

		const stream = result.data;
		let hasSeenTarget = false;
		stream
			.pipe(parse({ columns: true }))
			.on("data", (row: FetchedRow) => {
				if (row.location !== process.env.COUNTRY && hasSeenTarget) {
					stream.emit("end");
					return;
				}

				if (row.location !== process.env.COUNTRY) {
					return;
				}

				// We only want data for the current year.
				if (moment(row.date).year() != moment().year()) {
					return;
				}

				hasSeenTarget = true;
				this.statistics.push({
					confirmed: parseNumber(row.new_cases),
					date: row.date,
					deaths: parseNumber(row.new_deaths),
					vaccinations: parseNumber(row.new_vaccinations),
					totalConfirmed: parseNumber(row.total_cases),
					totalDeaths: parseNumber(row.total_deaths),
					totalVaccinations: parseNumber(row.total_vaccinations),
				});
			})
			.on("error", (err) => {
				if (err.name === "CvsError") {
					// This is expected, we're ending the stream halfway.
					return;
				}
			});
	}
}

/**
 * Direct representation of the CSV data that OWID's repository provides us.
 */
type FetchedRow = {
	iso_code: string;
	continent: string;
	location: string;
	date: string;
	total_cases: string;
	new_cases: string;
	new_cases_smoothed: string;
	total_deaths: string;
	new_deaths: string;
	new_deaths_smoothed: string;
	total_cases_per_million: string;
	new_cases_per_million: string;
	new_cases_smoothed_per_million: string;
	total_deaths_per_million: string;
	new_deaths_per_million: string;
	new_deaths_smoothed_per_million: string;
	reproduction_rate: string;
	icu_patients: string;
	icu_patients_per_million: string;
	hosp_patients: string;
	hosp_patients_per_million: string;
	weekly_icu_admissions: string;
	weekly_icu_admissions_per_million: string;
	weekly_hosp_admissions: string;
	weekly_hosp_admissions_per_million: string;
	new_tests: string;
	total_tests: string;
	total_tests_per_thousand: string;
	new_tests_per_thousand: string;
	new_tests_smoothed: string;
	new_tests_smoothed_per_thousand: string;
	positive_rate: string;
	tests_per_case: string;
	tests_units: string;
	total_vaccinations: string;
	people_vaccinated: string;
	people_fully_vaccinated: string;
	total_boosters: string;
	new_vaccinations: string;
	new_vaccinations_smoothed: string;
	total_vaccinations_per_hundred: string;
	people_vaccinated_per_hundred: string;
	people_fully_vaccinated_per_hundred: string;
	total_boosters_per_hundred: string;
	new_vaccinations_smoothed_per_million: string;
	stringency_index: string;
	population: string;
	population_density: string;
	median_age: string;
	aged_65_older: string;
	aged_70_older: string;
	gdp_per_capita: string;
	extreme_poverty: string;
	cardiovasc_death_rate: string;
	diabetes_prevalence: string;
	female_smokers: string;
	male_smokers: string;
	handwashing_facilities: string;
	hospital_beds_per_thousand: string;
	life_expectancy: string;
	human_development_index: string;
	excess_mortality_cumulative_absolute: string;
	excess_mortality_cumulative: string;
	excess_mortality: string;
	excess_mortality_cumulative_per_million: string;
};

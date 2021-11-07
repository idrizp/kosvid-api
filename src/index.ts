import { config } from "dotenv";
config();

import * as express from "express";

(async () => {
	const app = express();
	app.listen(process.env.PORT);
})();

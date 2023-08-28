import express from "express";
import cors from "cors";
import { env } from "./env";
import { routes } from "./routes";

// TODO:
// [] - Extract types so DRY
// [] - Extract endpoint from lib to env on client
// [] - Add snack with for user feedback
// [] - Emoji for channel page

const app = express();

app.use(cors());
routes(app);

app.listen(env.port, () => console.log(`listening on ${env.port}`));

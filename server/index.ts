import express from "express";
import { env } from "./env";
import { routes } from "./routes";

const app = express();

routes(app);

app.listen(env.port, () => console.log(`listening on ${env.port}`));

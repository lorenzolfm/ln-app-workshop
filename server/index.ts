import express from "express";
import cors from "cors";
import { env } from "./env";
import { routes } from "./routes";

const app = express();

app.use(cors());
routes(app);

app.listen(env.port, () => console.log(`listening on ${env.port}`));

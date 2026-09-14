import { buildApp } from "./app.js";
import { makePool } from "./db.js";

const port = Number(process.env.PORT ?? 3001);
const app = buildApp(makePool());
app.listen({ port, host: "0.0.0.0" }).catch((err) => { app.log.error(err); process.exit(1); });

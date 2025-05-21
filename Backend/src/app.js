import cors from "cors";
import express, { urlencoded, json } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import indexRoutes from "./routes/index.routes.js";

const app = express();

app.disable("x-powered-by");
app.use(cors({ credentials: true, origin: true }));
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api", indexRoutes);

export default app;

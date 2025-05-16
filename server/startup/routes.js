import { json } from "express";
import notFound from "../routes/notFound";
import error from "../middleware/error";

export default function (app) {
  app.use(json());
  app.use("*", notFound);
  app.use(error); // we just give refrence to this error function
};

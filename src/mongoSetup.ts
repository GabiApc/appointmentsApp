import mongoose from "mongoose";

import { config } from "./config";

export default () => {
  const connect = () => {
    mongoose
      .connect(`${config.DATABASE_URL}`)
      .then(() => {
        console.log("We have dB connection.");
      })
      .catch((error) => {
        console.error("Error connecting to dB", error);

        return process.exit(1);
      });
  };
  connect();

  mongoose.connection.on("disconnected", connect);
};

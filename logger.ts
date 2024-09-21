import { trace } from "console";
import pino, { LoggerOptions } from "pino";

const logdir: string = "./logs";
const logfile: string = `${logdir}/loader-${
  new Date(Date.now()).toISOString().split("T")[0]
}.log`;

const pinoOptions: LoggerOptions = {
  level: "info",
  formatters: {
    bindings: (bindings) => {
      return {
        pid: bindings.pid,
        host: bindings.hostname,
        node_version: process.version,
      };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: {
    pipeline: [
      {
        target: "pino-pretty", // must be installed separately
      },
      {
        target: "pino/file",
        options: { destination: logfile, mkdir: true },
      },
    ],
  },
};
export const logger = pino(pinoOptions);

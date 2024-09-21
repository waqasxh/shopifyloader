"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const logdir = "./logs";
const logfile = `${logdir}/loader-${new Date(Date.now()).toISOString().split("T")[0]}.log`;
const pinoOptions = {
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
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
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
exports.logger = (0, pino_1.default)(pinoOptions);
//# sourceMappingURL=logger.js.map
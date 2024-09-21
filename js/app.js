"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
const ek_1 = __importDefault(require("./processors/ek"));
let name = "Shopify Loader";
logger_1.logger.info(`Execution of  ${name} Started.`);
const records = (0, ek_1.default)();

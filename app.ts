import { logger } from "./logger";
import ekProcessor from "./processors/ek";

let name: string = "Shopify Loader";
logger.info(`Execution of  ${name} Started.`);

const records = ekProcessor();

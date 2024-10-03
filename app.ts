import { logger } from "./logger";
import { processFile, convertAndExportFile } from "./processors/ek";
import { retrievProductById } from "./processors/shopify";

let name: string = "Shopify Loader";
logger.info(`Execution of  ${name} Started.`);

//const records = processFile();
//convertAndExportFile();
retrievProductById("hello");

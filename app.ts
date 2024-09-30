import { logger } from "./logger";
import { processFile, convertAndExportFile } from "./processors/ek";

let name: string = "Shopify Loader";
logger.info(`Execution of  ${name} Started.`);

//const records = processFile();
convertAndExportFile();

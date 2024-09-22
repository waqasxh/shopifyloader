import fs from "node:fs";
import { parse } from "csv-parse";
import { logger } from "../logger";

const processFile = (): Array<object> => {
  let records: Array<object> = new Array<object>();
  const parser = fs
    .createReadStream("./source/ek/EKW_Inventory_feed_Export.csv")
    .pipe(parse({ delimiter: ",", columns: true }))
    .on("data", function (row) {
      logger.info(row);
      records.push(row);
    });

  return records;
};

export default processFile;

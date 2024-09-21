import fs from "node:fs";
import { parse } from "csv-parse";
import { logger } from "../logger";

const processFile = (): Array<string> => {
  let records: Array<string> = new Array<string>();
  const parser = fs
    .createReadStream("./source/ek/EKW_Inventory_feed_Export.csv")
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row) {
      logger.info(row);
      records.push(row);
    });

  return records;
};

export default processFile;

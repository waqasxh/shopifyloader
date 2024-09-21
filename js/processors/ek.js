"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const csv_parse_1 = require("csv-parse");
const logger_1 = require("../logger");
const processFile = () => {
    let records = new Array();
    const parser = node_fs_1.default
        .createReadStream("./source/ek/EKW_Inventory_feed_Export.csv")
        .pipe((0, csv_parse_1.parse)({ delimiter: ",", from_line: 2 }))
        .on("data", function (row) {
        logger_1.logger.info(row);
        records.push(row);
    });
    return records;
};
exports.default = processFile;

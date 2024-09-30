import fs from "node:fs";
import { parse } from "csv-parse";
import { stringify } from "csv-stringify";
import { logger } from "../logger";

const sourceCSVPath = "./source/ek/EKW_Inventory_feed_Export.csv";
const targetCSVPath = "./source/products_import.csv";

let currentHandle = "first-run";

const sourceHeaders = [
  "Variant SKU",
  "Handle",
  "Title",
  "Option1 Name",
  "Option1 Value",
  "Option2 Name",
  "Option2 Value",
  "Option3 Name",
  "Option3 Value",
  "Variant Inventory Qty",
  "Variant Weight",
  "Variant Price",
  "Variant Barcode",
  "Body HTML",
  "Variant Image",
  "Variant Tax Code",
];

const targetHeaders = [
  "Handle",
  "Title",
  "Body (HTML)",
  "Vendor",
  "Product Category",
  "Type",
  "Tags",
  "Published",
  "Option1 Name",
  "Option1 Value",
  "Option1 Linked To",
  "Option2 Name",
  "Option2 Value",
  "Option2 Linked To",
  "Option3 Name",
  "Option3 Value",
  "Option3 Linked To",
  "Variant SKU",
  "Variant Grams",
  "Variant Inventory Tracker",
  "Variant Inventory Qty",
  "Variant Inventory Policy",
  "Variant Fulfillment Service",
  "Variant Price",
  "Variant Compare At Price",
  "Variant Requires Shipping",
  "Variant Taxable",
  "Variant Barcode",
  "Image Src",
  "Image Position",
  "Image Alt Text",
  "Gift Card",
  "SEO Title",
  "SEO Description",
  "Google Shopping / Google Product Category",
  "Google Shopping / Gender",
  "Google Shopping / Age Group",
  "Google Shopping / MPN",
  "Google Shopping / Condition",
  "Google Shopping / Custom Product",
  "Google Shopping / Custom Label 0",
  "Google Shopping / Custom Label 1",
  "Google Shopping / Custom Label 2",
  "Google Shopping / Custom Label 3",
  "Google Shopping / Custom Label 4",
  "Google: Custom Product (product.metafields.mm-google-shopping.custom_product)",
  "Accessory size (product.metafields.shopify.accessory-size)",
  "Age group (product.metafields.shopify.age-group)",
  "Color (product.metafields.shopify.color-pattern)",
  "Fabric (product.metafields.shopify.fabric)",
  "Neckline (product.metafields.shopify.neckline)",
  "Outerwear clothing features (product.metafields.shopify.outerwear-clothing-features)",
  "Size (product.metafields.shopify.size)",
  "Sleeve length type (product.metafields.shopify.sleeve-length-type)",
  "Target gender (product.metafields.shopify.target-gender)",
  "Variant Image",
  "Variant Weight Unit",
  "Variant Tax Code",
  "Cost per item",
  "Included / United Kingdom",
  "Price / United Kingdom",
  "Compare At Price / United Kingdom",
  "Included / European Union",
  "Price / European Union",
  "Compare At Price / European Union",
  "Included / International",
  "Price / International",
  "Compare At Price / International",
  "Status",
];

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

const convertAndExportFile = async (): Promise<void> => {
  const parser = fs
    .createReadStream(sourceCSVPath)
    .pipe(parse({ columns: true, trim: true }));

  const transformer = stringify({ header: true, columns: targetHeaders });

  //write the transformed data to the target CSV file
  const writeStream = fs.createWriteStream(targetCSVPath);
  transformer.pipe(writeStream);

  parser.on("data", (row: any) => {
    const transformedRow = transformRow(row);
    transformer.write(transformedRow);
  });

  parser.on("end", () => {
    transformer.end();
    console.log("CSV transformation completed.");
  });

  parser.on("error", (error) => {
    console.error("Error processing CSV:", error);
  });
};

function transformRow(sourceRow: any): any {
  const targetRow: any = {};

  if (currentHandle === sourceRow["Handle"]) {
    targetRow["Handle"] = sourceRow["Handle"];
    targetRow["Option1 Value"] = sourceRow["Option1 Value"];
    targetRow["Option2 Value"] = sourceRow["Option2 Value"];
    targetRow["Variant Grams"] = (
      parseFloat(sourceRow["Variant Weight"]) * 1000
    ).toString();
    targetRow["Variant Inventory Qty"] = "0";
    targetRow["Variant Inventory Policy"] = "deny";
    targetRow["Variant Fulfillment Service"] = "manual";
    targetRow["Variant Price"] = (
      parseFloat(sourceRow["Variant Price"]) +
      4 +
      (parseFloat(sourceRow["Variant Price"]) * 40) / 100
    ).toString();
    targetRow["Variant Compare At Price"] = (
      parseFloat(sourceRow["Variant Price"]) +
      (parseFloat(sourceRow["Variant Price"]) * 50) / 100
    ).toString();
    targetRow["Variant Requires Shipping"] = "TRUE";
    targetRow["Variant Taxable"] = "FALSE";
    targetRow["Image Src"] = sourceRow["Variant Image"];
    targetRow["Variant Image"] = sourceRow["Variant Image"];
    targetRow["Variant Weight Unit"] = "kg";
    targetRow["Cost per item"] = (
      parseFloat(sourceRow["Variant Price"]) +
      4 +
      (parseFloat(sourceRow["Variant Price"]) * 20) / 100
    ).toString();
  } else {
    // map data from source to target where applicable
    targetRow["Handle"] = sourceRow["Handle"];
    targetRow["Title"] = sourceRow["Title"];
    targetRow["Body (HTML)"] = sourceRow["Body HTML"];
    targetRow["Vendor"] = "EK";
    targetRow["Published"] = "FALSE";
    targetRow["Option1 Name"] = sourceRow["Option1 Name"];
    targetRow["Option1 Value"] = sourceRow["Option1 Value"];
    targetRow["Option1 Linked To"] =
      sourceRow["Option1 Name"] === "Size"
        ? "product.metafields.shopify.size"
        : "product.metafields.shopify.color-pattern";
    targetRow["Option2 Name"] = sourceRow["Option2 Name"];
    targetRow["Option2 Value"] = sourceRow["Option2 Value"];
    targetRow["Option2 Linked To"] =
      sourceRow["Option2 Name"] === "Size"
        ? "product.metafields.shopify.size"
        : "product.metafields.shopify.color-pattern";
    targetRow["Variant SKU"] = sourceRow["Variant SKU"];
    targetRow["Variant Grams"] = (
      parseFloat(sourceRow["Variant Weight"]) * 1000
    ).toString();
    targetRow["Variant Inventory Qty"] = "0";
    targetRow["Variant Inventory Policy"] = "deny";
    targetRow["Variant Fulfillment Service"] = "manual";
    targetRow["Variant Price"] = (
      parseFloat(sourceRow["Variant Price"]) +
      4 +
      (parseFloat(sourceRow["Variant Price"]) * 40) / 100
    ).toString();
    targetRow["Variant Compare At Price"] = (
      parseFloat(sourceRow["Variant Price"]) +
      (parseFloat(sourceRow["Variant Price"]) * 50) / 100
    ).toString();
    targetRow["Variant Requires Shipping"] = "TRUE";
    targetRow["Variant Taxable"] = "FALSE";
    targetRow["Image Src"] = sourceRow["Variant Image"];
    targetRow["Gift Card"] = "0";
    targetRow["Variant Image"] = sourceRow["Variant Image"];
    targetRow["Variant Weight Unit"] = "kg";
    targetRow["Cost per item"] = (
      parseFloat(sourceRow["Variant Price"]) +
      4 +
      (parseFloat(sourceRow["Variant Price"]) * 20) / 100
    ).toString();
    targetRow["Included / United Kingdom"] = "TRUE";
    targetRow["Included / European Union"] = "TRUE";
    targetRow["Variant Taxable"] = "FALSE";
    targetRow["Status"] = "active";

    currentHandle = sourceRow["Handle"];
  }

  // other target fields that aren't in the source should be left empty
  targetHeaders.forEach((header) => {
    if (!(header in targetRow)) {
      targetRow[header] = "";
    }
  });

  return targetRow;
}

export { processFile, convertAndExportFile };

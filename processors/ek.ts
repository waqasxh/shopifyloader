import fs from "node:fs";
import { parse as parseAsync } from "csv-parse";
import { parse as parseSync } from "csv-parse/sync";
import { stringify } from "csv-stringify";
import { logger } from "../logger";
import { addProductSetEx, publishProductById } from "../processors/shopify";
import _ from "lodash";
import {
  ProductSet,
  File,
  ProductOption,
  ProductOptionValue,
  Variant,
  VariantOptionValue,
  AddedProduct,
  FailedProduct,
  InventoryQuantity,
} from "../interfaces";
import {
  writeAddedProductToCSV,
  writeFailedProductToCSV,
  loadAddedProducts,
} from "../helper";

const sourceCSVPathEK = "./source/ek/EKW_Inventory_feed_Export.csv";
const targetCSVPathEK = "./source/ek/products_import.csv";
const successCSVPathEK = "./source/ek/processing_success.csv";
const failCSVPathEK = "./source/ek/processing_fail.csv";

let currentHandle = "first-handle";

let firstAddition: Boolean = true;

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

const processEKFile = (): Array<object> => {
  let records: Array<object> = new Array<object>();
  const parser = fs
    .createReadStream(sourceCSVPathEK)
    .pipe(parseAsync({ delimiter: ",", columns: true }))
    .on("data", function (row) {
      logger.info(row);
      records.push(row);
    });

  return records;
};

const processEKFileEx = (): Array<ProductSet> => {
  let productSetList: ProductSet[] = [];

  if (!fs.existsSync(sourceCSVPathEK)) {
    return productSetList;
  }

  let currentOption1 = "first-option1";
  let currentOption2 = "first-option2";

  let newProductSet = {} as ProductSet;

  let previousProducts: AddedProduct[] = loadAddedProducts(successCSVPathEK);

  const fileContent = fs.readFileSync(sourceCSVPathEK, "utf8");
  const rows = parseSync(fileContent, {
    delimiter: ",",
    columns: true,
    skip_empty_lines: true,
  });

  for (const row of rows) {
    if (currentHandle === row["Handle"]) {
      const newFile: File = {
        originalSource: row["Variant Image"],
      };

      if (!_.find(newProductSet.files, newFile)) {
        newProductSet.files.push(newFile);
      }

      const productOption1Value: ProductOptionValue = {
        name: row["Option1 Value"],
      };

      if (
        !_.find(newProductSet.productOptions[0].values, productOption1Value)
      ) {
        newProductSet.productOptions[0].values.push(productOption1Value);
      }

      const productOption2Value: ProductOptionValue = {
        name: row["Option2 Value"],
      };

      if (
        !_.find(newProductSet.productOptions[1].values, productOption2Value)
      ) {
        newProductSet.productOptions[1].values.push(productOption2Value);
      }
      const variantOptionValue1: VariantOptionValue = {
        optionName: row["Option1 Name"],
        name: row["Option1 Value"],
      };

      const variantOptionValue2: VariantOptionValue = {
        optionName: row["Option2 Name"],
        name: row["Option2 Value"],
      };

      const inventoryQuantity: InventoryQuantity = {
        locationId: "gid://shopify/Location/98172928342", //United Kingdom
        name: "available",
        quantity: Number(row["Variant Inventory Qty"]),
      };

      const newVariant: Variant = {
        optionValues: [variantOptionValue1, variantOptionValue2],
        file: newFile,
        price: Number(
          (
            parseFloat(row["Variant Price"]) +
            4 +
            (parseFloat(row["Variant Price"]) * 40) / 100
          ).toString()
        ),
        sku: row["Variant SKU"],
        compareAtPrice: Number(
          (
            parseFloat(row["Variant Price"]) +
            4 +
            (parseFloat(row["Variant Price"]) * 50) / 100
          ).toString()
        ),
        inventoryQuantities: [inventoryQuantity],
        inventoryPolicy: "DENY",
      };

      newProductSet.variants.push(newVariant);
    } else {
      if (currentHandle !== "first-handle") {
        productSetList.push(newProductSet);
      }

      newProductSet = {} as ProductSet;

      newProductSet.collections = [
        //"gid://shopify/Collection/631112204630", //load collection(s) against each product from shopify store
      ];

      newProductSet.descriptionHtml = row["Body HTML"];

      const newFile: File = {
        originalSource: row["Variant Image"],
      };

      newProductSet.files = [newFile];

      newProductSet.handle = row["Handle"];

      const productOption1Value: ProductOptionValue = {
        name: row["Option1 Value"],
      };

      const productOption1: ProductOption = {
        name: row["Option1 Name"],
        position: 1,
        values: [productOption1Value],
      };

      const productOption2Value: ProductOptionValue = {
        name: row["Option2 Value"],
      };

      const productOption2: ProductOption = {
        name: row["Option2 Name"],
        position: 1,
        values: [productOption2Value],
      };

      newProductSet.productOptions = [productOption1];
      newProductSet.productOptions.push(productOption2);

      newProductSet.status = "ACTIVE";
      newProductSet.title = row["Title"];

      const variantOptionValue1: VariantOptionValue = {
        optionName: row["Option1 Name"],
        name: row["Option1 Value"],
      };

      const variantOptionValue2: VariantOptionValue = {
        optionName: row["Option2 Name"],
        name: row["Option2 Value"],
      };

      const inventoryQuantity: InventoryQuantity = {
        locationId: "gid://shopify/Location/98172928342", //United Kingdom
        name: "available",
        quantity: Number(row["Variant Inventory Qty"]),
      };

      const newVariant: Variant = {
        optionValues: [variantOptionValue1, variantOptionValue2],
        file: newFile,
        price: Number(
          (
            parseFloat(row["Variant Price"]) +
            4 +
            (parseFloat(row["Variant Price"]) * 40) / 100
          ).toString()
        ),
        sku: row["Variant SKU"],
        compareAtPrice: Number(
          (
            parseFloat(row["Variant Price"]) +
            4 +
            (parseFloat(row["Variant Price"]) * 50) / 100
          ).toString()
        ),
        inventoryQuantities: [inventoryQuantity],
        inventoryPolicy: "DENY",
      };

      newProductSet.variants = [newVariant];

      newProductSet.vendor = "EK";

      let previousRecord = _.find(previousProducts, {
        handle: row["Handle"],
      });

      if (previousRecord) {
        newProductSet.id = previousRecord.id;
      }

      currentHandle = row["Handle"];
      currentOption1 = row["Option1 Value"];
      currentOption2 = row["Option2 Value"];
    }
  }

  return productSetList;
};

const convertAndExportFile = async (): Promise<void> => {
  const parser = fs
    .createReadStream(sourceCSVPathEK)
    .pipe(parseAsync({ columns: true, trim: true }));

  const transformer = stringify({ header: true, columns: targetHeaders });

  //write the transformed data to the target CSV file
  const writeStream = fs.createWriteStream(targetCSVPathEK);
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

function appendAddedProductToCSV(
  products: AddedProduct[],
  fileName: string
): void {
  const csvRows =
    products
      .map((product) => `${product.id},${product.handle},${product.title}`)
      .join(",\n") + ",\n";

  fs.appendFile(fileName, csvRows, "utf8", (error) => {
    if (error) {
      console.error("Error appending to CSV file:", error);
    } else {
      console.log(`Data appended to CSV file "${fileName}" successfully.`);
    }
  });
}

async function loadAllEKroducts(): Promise<void> {
  let productSetList: ProductSet[] = processEKFileEx();
  let successProductList: AddedProduct[] = [];
  let failedProductList: FailedProduct[] = [];

  for (const newProductSet of productSetList) {
    try {
      await addProductSetEx(newProductSet).then(
        ({ data, errors, extensions }) => {
          if (data) {
            logger.info("New ProductSet");
            logger.info(newProductSet);
            logger.info("ProductSet Result");
            logger.info(data);

            if (!newProductSet.id) {
              successProductList.push({
                id: data.productSet.product.id,
                handle: data.productSet.product.handle,
                title: data.productSet.product.title,
              });
            }
            publishProductById(
              data.productSet.product.id,
              "gid://shopify/Publication/248231526742"
            );
          } else if (errors) {
            failedProductList.push({
              handle: newProductSet.handle,
              title: newProductSet.title,
            });
            logger.error("ProductSet Errors");
            logger.error(errors);
            logger.error("ProductSet Extensions");
            logger.error(extensions);
          }
        }
      );
    } catch (e) {
      failedProductList.push({
        handle: newProductSet.handle,
        title: newProductSet.title,
      });
      logger.error("Exception");
      logger.error(e);
      logger.error("ProductSet");
      logger.error(newProductSet);
    }
  }

  if (successProductList.length > 0) {
    writeAddedProductToCSV(successProductList, successCSVPathEK);
  }

  if (failedProductList.length > 0) {
    writeFailedProductToCSV(failedProductList, failCSVPathEK);
  }
}

export {
  processEKFile,
  convertAndExportFile,
  processEKFileEx,
  loadAllEKroducts,
};

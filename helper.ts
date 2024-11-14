import * as fs from "fs";
import * as path from "path";
import { AddedProduct, FailedProduct, Product } from "./interfaces";
import _, { Function } from "lodash";
import { parse as parseSync } from "csv-parse/sync";
import { logger } from "./logger";

const jsonFolderPath =
  "D:\\Projects\\Ecommerce\\QBCL\\AwasmScrapper\\ProductsJson\\";

const loadJsonFile = async (fileName: string): Promise<any> => {
  try {
    const filePath = path.join(jsonFolderPath, fileName);
    const fileContent = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    logger.error("Error loading JSON file:", error);
    throw error;
  }
};

const loadAllJsonFiles = async (): Promise<any[]> => {
  try {
    const files = await fs.promises.readdir(jsonFolderPath);
    const jsonFilesData: any[] = [];

    for (const file of files) {
      const filePath = path.join(jsonFolderPath, file);

      if (path.extname(file) === ".json") {
        const fileContent = await fs.promises.readFile(filePath, "utf-8");
        const jsonData = JSON.parse(fileContent);
        jsonFilesData.push(jsonData);
      }
    }

    return jsonFilesData;
  } catch (error) {
    logger.error("Error loading JSON files:", error);
    throw error;
  }
};

const sanitizeScrappedFiles = async (): Promise<string[]> => {
  try {
    const files = await fs.promises.readdir(jsonFolderPath);
    const jsonFiles: string[] = [];

    for (const file of files) {
      const filePath = path.join(jsonFolderPath, file);

      if (path.extname(file) === ".json") {
        const fileContent = await fs.promises.readFile(filePath, "utf-8");
        const jsonData = JSON.parse(fileContent);

        const searchTerms = ["lubricant", "vaginal", "vagina", "anal"];
        const isAnyFound = findWordsInJson(jsonData, searchTerms);
        if (isAnyFound) {
          jsonFiles.push(file);
        }
      }
    }

    return jsonFiles;
  } catch (error) {
    logger.error("Error loading JSON files:", error);
    throw error;
  }
};

function seoFriendlyUrlHandle(title: string) {
  return _.toLower(title.trim().replace(/\s+/g, "-").replace(/-+/g, "-"));
}

function writeLinksToFile(filename: string, links: string[]): void {
  const content = links.join("\n");

  // Check if the file already exists; if not, create it
  const filePath = path.resolve(filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, ""); // Creates an empty file if it doesn't exist
  }

  // Write failed links to the file
  fs.writeFile(filePath, content, (err) => {
    if (err) {
      logger.error("Error writing to file:", err);
    } else {
      logger.info("Failed links written to", filename);
    }
  });
}

function writeAddedProductToCSV(
  products: AddedProduct[],
  fileName: string
): void {
  const csvHeaders = "Id,Handle,Title\n";
  const csvRows = products
    .map((product) => `${product.id},${product.handle},${product.title}`)
    .join("\n");
  const csvContent = csvHeaders + csvRows;

  fs.writeFile(fileName, csvContent, "utf8", (error) => {
    if (error) {
      logger.error("Error writing to Success CSV file:", error);
    } else {
      logger.info(`CSV file "${fileName}" created successfully.`);
    }
  });
}

function writeFailedProductToCSV(
  products: FailedProduct[],
  fileName: string
): void {
  const csvHeaders = "Handle,Title\n";
  const csvRows = products
    .map((product) => `${product.handle},${product.title}`)
    .join("\n");
  const csvContent = csvHeaders + csvRows;

  fs.writeFile(fileName, csvContent, "utf8", (error) => {
    if (error) {
      logger.error("Error writing to Failed CSV file:", error);
    } else {
      logger.info(`CSV file "${fileName}" created successfully.`);
    }
  });
}

const loadAddedProducts = (filePath: string): AddedProduct[] => {
  const records: AddedProduct[] = [];

  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const rows = parseSync(fileContent, {
      delimiter: ",",
      columns: true,
      skip_empty_lines: true,
    });

    for (const row of rows) {
      records.push({
        id: row["Id"],
        handle: row["Handle"],
        title: row["Title"],
      });
    }
  }

  return records;
};

function removeExtraQuotes(str: string): string {
  return str.replace(/^"+|"+$/g, "");
}

function removeAdditionalCharacters(str: string): string {
  return str.replace(/^```html\n/, "").replace(/\n```$/, "");
}

function replaceCommas(str: string) {
  return str.replace(/,/g, " |");
}

function findWordsInJson(jsonData: any, searchTerms: string[]): boolean {
  const jsonString = _.toLower(JSON.stringify(jsonData));
  return searchTerms.some((term) => jsonString.includes(term));
}

function readLinesFromFile(filePath: string): string[] {
  let retVal: string[] = [];
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");

    retVal = fileContent.split("\n").map((line) => line.trim());
  } catch {
    //do some expeption handling
  }
  return retVal;
}

const reconsileQuantities = async (
  sourceCSVPath: string,
  vendor: string,
  loadProductsDataFromFile: () => Product[],
  retrieVariantById: (id: string) => Promise<any>
): Promise<void> => {
  if (!fs.existsSync(sourceCSVPath)) {
    return;
  }

  const fileContent = fs.readFileSync(sourceCSVPath, "utf8");
  const feedsDataEK = parseSync(fileContent, {
    delimiter: ",",
    columns: true,
    skip_empty_lines: true,
  });

  const productsData = loadProductsDataFromFile();
  const productsDataEK = _.filter(productsData, { vendor: vendor });

  for (const productDataEK of productsDataEK) {
    const variantsData = productDataEK.variantDetails
      .split(", ")
      .map((entry: any) => {
        const [variantId, variantSKU] = entry.split("^");
        return { variantId, variantSKU };
      });

    for (const variantData of variantsData) {
      const feedDataEK = _.find(feedsDataEK, {
        "Variant SKU": variantData.variantSKU,
      });

      var result = await retrieVariantById(variantData.variantId);
      logger.info(result.data);
    }

    try {
    } catch (e) {}
  }
};

const activateQuantities = async (
  vendor: string,
  activatedSuccess: string,
  activatedFail: string,
  loadProductsDataFromFile: () => Product[],
  retrieVariantById: (id: string) => Promise<any>,
  activateInventryById: (inventryId: string) => Promise<any>
): Promise<void> => {
  const productsData = loadProductsDataFromFile();
  const productsDataVendor = _.filter(productsData, { vendor: vendor });

  for (const productDataVendor of productsDataVendor) {
    const variantsData = productDataVendor.variantDetails
      .split(", ")
      .map((entry: any) => {
        const [variantId, variantSKU] = entry.split("^");
        return { variantId, variantSKU };
      });
    let previousVariants = readLinesFromFile(activatedSuccess);

    for (const variantData of variantsData) {
      const previousVariant = _.includes(
        previousVariants,
        variantData.variantId
      );
      if (!previousVariant) {
        let variantResult = await retrieVariantById(variantData.variantId);
        if (variantResult.data) {
          let inventryItemId: string =
            variantResult.data.productVariant.inventoryItem.id;
          try {
            let activationResult = await activateInventryById(inventryItemId);
            logger.info(`Inventry Item Id: ${inventryItemId}`);

            fs.appendFileSync(activatedSuccess, variantData.variantId + "\n", {
              flag: "a",
            });
          } catch (e) {
            logger.error(`Exception: ${e}`);
            logger.error(`Inventry Item Id: ${inventryItemId}`);

            fs.appendFileSync(activatedFail, variantData.variantId + "\n", {
              flag: "a",
            });
          }
        }
      }
    }
  }
};

export {
  loadJsonFile,
  loadAllJsonFiles,
  seoFriendlyUrlHandle,
  writeLinksToFile,
  writeAddedProductToCSV,
  writeFailedProductToCSV,
  loadAddedProducts,
  removeExtraQuotes,
  removeAdditionalCharacters,
  replaceCommas,
  findWordsInJson,
  sanitizeScrappedFiles,
  readLinesFromFile,
  activateQuantities,
};

import * as fs from "fs";
import * as path from "path";
import { AddedProduct, FailedProduct } from "./interfaces";
import _ from "lodash";

const jsonFolderPath =
  "D:\\Projects\\Ecommerce\\QBCL\\AwasmScrapper\\ProductsJson\\";

const loadJsonFile = async (fileName: string): Promise<any> => {
  try {
    const filePath = path.join(jsonFolderPath, fileName);
    const fileContent = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error loading JSON file:", error);
    throw error;
  }
};

const loadAllJsonFiles = async (): Promise<any[]> => {
  try {
    // Read directory contents
    const files = await fs.promises.readdir(jsonFolderPath);
    const jsonFilesData: any[] = [];

    // Iterate over each file
    for (const file of files) {
      const filePath = path.join(jsonFolderPath, file);

      // Check if it's a JSON file
      if (path.extname(file) === ".json") {
        const fileContent = await fs.promises.readFile(filePath, "utf-8");
        const jsonData = JSON.parse(fileContent);
        jsonFilesData.push(jsonData);
      }
    }

    return jsonFilesData;
  } catch (error) {
    console.error("Error loading JSON files:", error);
    throw error;
  }
};

function seoFriendlyUrlHandle(title: string) {
  return _.toLower(
    title
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
  );
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
      console.error("Error writing to file:", err);
    } else {
      console.log("Failed links written to", filename);
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
      console.error("Error writing to Success CSV file:", error);
    } else {
      console.log(`CSV file "${fileName}" created successfully.`);
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
      console.error("Error writing to Failed CSV file:", error);
    } else {
      console.log(`CSV file "${fileName}" created successfully.`);
    }
  });
}

export {
  loadJsonFile,
  loadAllJsonFiles,
  seoFriendlyUrlHandle,
  writeLinksToFile,
  writeAddedProductToCSV,
  writeFailedProductToCSV,
};

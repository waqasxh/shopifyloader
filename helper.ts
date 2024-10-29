import * as fs from "fs";
import * as path from "path";

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

export { loadJsonFile, loadAllJsonFiles };

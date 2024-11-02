import { forEach } from "lodash";
import { loadAllJsonFiles } from "../helper";
import { retrievAvailableCategories } from "./shopify";

export async function processAllScrappedFiles(): Promise<any> {
  loadAllJsonFiles().then((productsData) => {
    retrievAvailableCategories().then((collectionNodes) => {
      for (const productData of productsData) {
        let targetCategory = productData.Category;
        if (targetCategory == "Fitness & Gym") {
          targetCategory = "Health & Fitness";
        }
        if (targetCategory == "Sport & Outdoor") {
          targetCategory = "Sports & Outdoor";
        }
        const collection = collectionNodes.find(
          (node) => node.title === targetCategory
        );
        const collectionID = collection ? collection.id : productData.Category;
        console.log(collectionID);
      }
    });
  });
}

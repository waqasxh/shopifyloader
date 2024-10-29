import { forEach } from "lodash";
import { loadAllJsonFiles } from "../helper";

export async function processAllScrappedFiles(): Promise<any> {
  loadAllJsonFiles().then((productsData) => {
    for (const productData of productsData) {
      console.log(productData);
    }
  });
}

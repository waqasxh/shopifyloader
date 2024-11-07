import { retrievProducts } from "./shopify";
import { ProductResponse, Product } from "../interfaces";
import * as fs from "fs";
import { logger } from "../logger";

const current_inventry = "./source/current_inventry.txt";

export async function processLoadedProducts(): Promise<any> {
  let hasNextPage = true;
  let cursor: string | null = null;

  if (!fs.existsSync(current_inventry)) {
    const headers = "Product ID|Vendor|Collection IDs|Variant Details|Cursor\n";
    fs.writeFileSync(current_inventry, headers);
  }

  while (hasNextPage) {
    const result = await retrievProducts(10, cursor);
    const graphqlJson: ProductResponse = result;
    const products = graphqlJson.data.products;

    products.edges.forEach((productEdge) => {
      const product = productEdge.node;
      const productId = product.id;
      const vendor = product.vendor;
      const collectionIds = product.collections.edges
        .map((collectionEdge) => collectionEdge.node.id)
        .join(", ");

      const variantDetails = product.variants.edges
        .map((variantEdge) => {
          const variantId = variantEdge.node.id;
          const sku = variantEdge.node.sku;
          return `${variantId}:${sku}`;
        })
        .join(", ");

      // const variantIds = product.variants.edges
      //   .map((variantEdge) => variantEdge.node.id)
      //   .join(", ");
      // const variantSkus = product.variants.edges
      //   .map((variantEdge) => variantEdge.node.sku)
      //   .join(", ");

      const currentCursor = productEdge.cursor;

      //const productData = `${productId}|${vendor}|${collectionIds}|${variantIds}|${variantSkus}|${currentCursor}\n`;

      const productData = `${productId}|${vendor}|${collectionIds}|${variantDetails}|${currentCursor}\n`;

      fs.appendFileSync(current_inventry, productData, { flag: "a" });
    });

    hasNextPage = products.pageInfo.hasNextPage;
    cursor =
      products.edges.length > 0
        ? products.edges[products.edges.length - 1].cursor
        : null;
    logger.info(`Fetching next batch of records with cursor ${cursor}.`);
  }

  logger.info("Finished processing all products.");
}

export function loadProductsDataFromFile(): Product[] {
  if (!fs.existsSync(current_inventry)) {
    throw new Error("File does not exist");
  }

  const fileContent = fs.readFileSync(current_inventry, "utf-8");
  const lines = fileContent.split("\n").filter((line) => line.trim() !== "");

  const [header, ...dataLines] = lines;

  const products: Product[] = dataLines.map((line) => {
    const [productId, vendor, collectionIds, variantDetails] = line.split("|");

    return {
      productId: productId.trim(),
      vendor: vendor.trim(),
      collectionIds: collectionIds.trim(),
      variantDetails: variantDetails.trim(),
    };
  });

  return products;
}

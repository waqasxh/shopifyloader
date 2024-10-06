import { logger } from "./logger";
import { processFile, convertAndExportFile } from "./processors/ek";
import {
  retrievProductById,
  unpublishProductById,
  addProductSet,
  addProductSetEx,
} from "./processors/shopify";

let name: string = "Shopify Loader";
logger.info(`Execution of  ${name} Started.`);

//const records = processFile();

//convertAndExportFile();

//retrievProductById("gid://shopify/Product/9179310391638");
// unpublishProductById(
//   "gid://shopify/Product/9179310391638",
//   "gid://shopify/Publication/248231526742",
//   "2024-09-23T02:31:51Z"
// );

//addProductSet();

const result = addProductSetEx().then((data) => {
  const id = data.productSet.product.id;
  const handle = data.productSet.product.handle;
});

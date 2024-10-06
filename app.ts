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

const result = addProductSetEx(
  [
    "gid://shopify/Collection/631220535638", //deals & clearance
    "gid://shopify/Collection/631220633942", //new arivals
    "gid://shopify/Collection/631220765014", //fashion & accessories
  ],
  "Keep your hands toasty in the winter",
  [
    {
      originalSource:
        "https://cdn.shopify.com/s/files/1/0558/8628/2915/products/navy_aa6195b6-2585-4b4e-b1c2-f4b8ff904b42.jpg?v=1650971345",
    },
  ],
  "winter-gloves",
  [
    {
      name: "Color",
      position: 1,
      values: [
        {
          name: "Grey",
        },
        {
          name: "Black",
        },
      ],
    },
  ],
  "ACTIVE",
  "Winter gloves",
  [
    {
      optionValues: [
        {
          optionName: "Color",
          name: "Grey",
        },
      ],
      file: {
        originalSource:
          "https://cdn.shopify.com/s/files/1/0558/8628/2915/products/navy_aa6195b6-2585-4b4e-b1c2-f4b8ff904b42.jpg?v=1650971345",
      },
      price: 11.99,
    },
  ],
  "EK"
).then(({ data, errors, extensions }) => {
  const id = data.productSet.product.id;
  const handle = data.productSet.product.handle;
});

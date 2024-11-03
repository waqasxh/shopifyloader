import { logger } from "./logger";
import {
  processEKFile,
  convertAndExportFile,
  processEKFileEx,
  loadAllEKroducts,
} from "./processors/ek";
import {
  retrievProductById,
  unpublishProductById,
  addProductSet,
  retrievAvailableCategories,
} from "./processors/shopify";
import { processAllScrappedFiles } from "./processors/awasm";
import { loadJsonFile } from "./helper";

import {
  categoryConfirmation,
  seoFriendlyTitle,
  seoFriendlyDescription,
} from "./processors/openai";

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

// const result = addProductSet(
//   [
//     "gid://shopify/Collection/631220535638", //deals & clearance
//     "gid://shopify/Collection/631220633942", //new arivals
//     "gid://shopify/Collection/631220765014", //fashion & accessories
//   ],
//   "Keep your hands toasty in the winter",
//   [
//     {
//       originalSource:
//         "https://cdn.shopify.com/s/files/1/0558/8628/2915/products/navy_aa6195b6-2585-4b4e-b1c2-f4b8ff904b42.jpg?v=1650971345",
//     },
//   ],
//   "winter-gloves",
//   [
//     {
//       name: "Color",
//       position: 1,
//       values: [
//         {
//           name: "Grey",
//         },
//         {
//           name: "Black",
//         },
//       ],
//     },
//   ],
//   "ACTIVE",
//   "Winter gloves",
//   [
//     {
//       optionValues: [
//         {
//           optionName: "Color",
//           name: "Grey",
//         },
//       ],
//       file: {
//         originalSource:
//           "https://cdn.shopify.com/s/files/1/0558/8628/2915/products/navy_aa6195b6-2585-4b4e-b1c2-f4b8ff904b42.jpg?v=1650971345",
//       },
//       price: 11.99,
//     },
//   ],
//   "EK"
// ).then(({ data, errors, extensions }) => {
//   const id = data.productSet.product.id;
//   const handle = data.productSet.product.handle;
// });

//loadAllEKroducts();

// loadJsonFile("S0671265757.json").then((data) => {
//   categoryConfirmation(data).then((result) => {
//     console.log(result);
//   });

//   seoFriendlyTitle(data).then((result) => {
//     console.log(result);
//   });

//   seoFriendlyDescription(data).then((result) => {
//     console.log(result);
//   });
// });

processAllScrappedFiles();

// retrievAvailableCategories().then((result) => {
//   console.log(result);
// });

// const result = addProductSet(
//   [
//     "gid://shopify/Collection/631220928854", //From API Call
//   ],
//   "<p>The 100 Series clipper is the perfect 9 piece home haircutting kit. Containing 4 clip on guide combs ranging from 3-13mm and a thumb adjustable taper lever for more precise cutting lenghts, the 10 series clipper gives you total control allowing for full haircuts.</p>", // Description from OpenAI Call
//   [
//     {
//       originalSource:
//         "https://images.avasam.com/?url=https://avasamnew.s3.amazonaws.com/live/GB010026/79233-917_0.jpg",
//     },
//     {
//       originalSource:
//         "https://images.avasam.com/?url=https://avasamnew.s3.amazonaws.com/live/GB010026/79233-917_13.jpg",
//     },
//     {
//       originalSource:
//         "https://images.avasam.com/?url=https://avasamnew.s3.amazonaws.com/live/GB010026/79233-917_12.jpg",
//     },
//   ],
//   "wahl-100-groomease-series-hair-clipper-men-black", //Handle generated from Code
//   [
//     {
//       name: "Color",
//       position: 1,
//       values: [
//         {
//           name: "Black",
//         },
//       ],
//     },
//   ],
//   "ACTIVE",
//   "Wahl 100 GroomEase Series Hair Clipper for Men - Black", //Title form Open AI Call
//   [
//     {
//       optionValues: [
//         {
//           optionName: "Color",
//           name: "Black",
//         },
//       ],
//       file: {
//         originalSource:
//           "https://images.avasam.com/?url=https://avasamnew.s3.amazonaws.com/live/GB010026/79233-917_0.jpg",
//       },
//       price: 22.99,
//       sku: "79233-917",
//       inventoryQuantities: {
//         locationId: "gid://shopify/Location/98172928342", //United Kingdom
//         name: "available",
//         quantity: 200,
//       },
//     },
//   ],
//   "Awasm"
// ).then(({ data, errors, extensions }) => {
//   const id = data.productSet.product.id;
//   const handle = data.productSet.product.handle;
// });

//logger.info(`Execution of  ${name} Ended.`);

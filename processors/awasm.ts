import { forEach } from "lodash";
import { logger } from "../logger";
import {
  loadAllJsonFiles,
  seoFriendlyUrlHandle,
  writeLinksToFile,
  writeAddedProductToCSV,
  writeFailedProductToCSV,
  loadAddedProducts,
  removeExtraQuotes,
  removeAdditionalCharacters,
  replaceCommas,
} from "../helper";
import { retrievAvailableCategories } from "./shopify";
import {
  categoryConfirmation,
  seoFriendlyTitle,
  seoFriendlyDescription,
  seoFriendlyURLSlug,
} from "./openai";
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
import _ from "lodash";
import { addProductSetEx, publishProductById } from "../processors/shopify";

const successCSVPathAwasm = "./source/awasm/processing_success.csv";
const failCSVPathAwasm = "./source/awasm/processing_fail.csv";
const failAwasmLinks = "./source/awasm/failed_links.txt";

export async function processAllScrappedFiles(): Promise<any> {
  let successProductList: AddedProduct[] = [];
  let failedProductList: FailedProduct[] = [];

  let failedLinks: string[] = [];

  let newProductSet = {} as ProductSet;

  let previousProducts: AddedProduct[] = loadAddedProducts(successCSVPathAwasm);

  loadAllJsonFiles().then((productsData) => {
    retrievAvailableCategories().then(async (collectionNodes) => {
      for (const productData of productsData) {
        let confirmedCategory = await categoryConfirmation(productData);
        if (_.toLower(confirmedCategory.content) == "true") {
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
          const collectionID: string = collection
            ? collection.id
            : productData.Category;

          newProductSet = await parseAwasmFile(productData);

          newProductSet.collections = [collectionID];

          let previousRecord = _.find(previousProducts, {
            handle: newProductSet.handle,
          });

          if (previousRecord) {
            newProductSet.id = previousRecord.id;
          }

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
        } else {
          failedLinks.push(productData.Link);
        }
      }

      if (failedLinks.length > 0) {
        writeLinksToFile(failAwasmLinks, failedLinks);
      }

      if (successProductList.length > 0) {
        writeAddedProductToCSV(successProductList, successCSVPathAwasm);
      }

      if (failedProductList.length > 0) {
        writeFailedProductToCSV(failedProductList, failCSVPathAwasm);
      }
    });
  });
}

const parseAwasmFile = async (input: any): Promise<ProductSet> => {
  let seoTitle = await seoFriendlyTitle(input);
  let seoDescription = await seoFriendlyDescription(input);
  let seoUrlSlug = await seoFriendlyURLSlug(input);

  let newProductSet = {} as ProductSet;

  newProductSet.descriptionHtml = removeAdditionalCharacters(
    seoDescription.content
  );
  newProductSet.title = replaceCommas(removeExtraQuotes(seoTitle.content));

  newProductSet.files = input.ImageUrls.map((link: string) => ({
    originalSource: link,
  }));

  newProductSet.handle = seoUrlSlug.content;

  const productOption1Value: ProductOptionValue = {
    name: input.Specifications.Colour ?? "Standard",
  };

  const productOption1: ProductOption = {
    name: "Color",
    position: 1,
    values: [productOption1Value],
  };

  newProductSet.productOptions = [productOption1];

  newProductSet.status = "ACTIVE";
  newProductSet.vendor = "Awasm";

  const variantOptionValue1: VariantOptionValue = {
    optionName: "Color",
    name: input.Specifications.Colour ?? "Standard",
  };

  const priceInput = input.Price.replace(/\*$/, "");

  const inventoryQuantity: InventoryQuantity = {
    locationId: "gid://shopify/Location/98172928342", //United Kingdom
    name: "available",
    quantity: Number(input.Quantity),
  };

  const newVariant: Variant = {
    optionValues: [variantOptionValue1],
    file: newProductSet.files[0],
    price: Number(
      (
        parseFloat(priceInput) +
        4 +
        (parseFloat(priceInput) * 40) / 100
      ).toString()
    ),
    sku: input.SKU,
    compareAtPrice: Number(
      (
        parseFloat(priceInput) +
        4 +
        (parseFloat(priceInput) * 50) / 100
      ).toString()
    ),
    inventoryQuantities: [inventoryQuantity],
    inventoryPolicy: "DENY",
  };

  newProductSet.variants = [newVariant];

  return newProductSet;
};

import { createGraphQLClient } from "@shopify/graphql-client";

const shopifyAccessToken = process.env.SHOPIFY_ACCCESS_TOKEN;
const shopifyAGraphQLUrl = process.env.SHOPIFY_GRAPHQL_URL;

const client = createGraphQLClient({
  url: shopifyAGraphQLUrl
    ? shopifyAGraphQLUrl
    : "https://{StoreName}.myshopify.com/admin/api/2024-10/graphql.json",
  headers: {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": shopifyAccessToken
      ? shopifyAccessToken
      : "{ACCESSTOKEN}",
  },
  retries: 1,
});

async function retrievProductById(id: string): Promise<any> {
  const query = `query productWithId ($productId:ID!)
      {
      product(id: $productId) {
        id
        title
        status
      }
    }`;
  const { data, errors, extensions } = await client.request(query, {
    variables: {
      productId: id,
    },
  });
}

async function unpublishProductById(
  productId: string,
  publicationId: string,
  publicationDate: string
): Promise<any> {
  const mutation = `mutation publishableUnpublish($id: ID!, $input: [PublicationInput!]!) {
  publishableUnpublish(id: $id, input: $input) {
    publishable {
      availablePublicationsCount {
        count
      }
      resourcePublicationsCount {
        count
      }
    }
    shop {
      publicationCount
    }
    userErrors {
      field
      message
    }
  }
}`;
  const { data, errors, extensions } = await client.request(mutation, {
    variables: {
      id: productId,
      input: {
        publicationId: publicationId,
        publishDate: publicationDate,
      },
    },
  });
}

async function addProductSet(): Promise<any> {
  const mutation = `mutation createProductAsynchronous($productSet: ProductSetInput!, $synchronous: Boolean!) {
      productSet(synchronous: $synchronous, input: $productSet) {
        product {
          id
        }
        productSetOperation {
          id
          status
          userErrors {
            code
            field
            message
          }
        }
        userErrors {
          code
          field
          message
        }
      }
    }`;
  const { data, errors, extensions } = await client.request(mutation, {
    variables: {
      synchronous: true,
      productSet: {
        collections: [
          "gid://shopify/Collection/631220535638", //deals & clearance
          "gid://shopify/Collection/631220633942", //new arivals
          "gid://shopify/Collection/631220765014", //fashion & accessories
        ],
        descriptionHtml: "Keep your hands toasty in the winter",
        // files: [
        //   {
        //     originalSource:
        //       "https://cdn.shopify.com/s/files/1/0558/8628/2915/products/navy_aa6195b6-2585-4b4e-b1c2-f4b8ff904b42.jpg?v=1650971345",
        //     contentType: "IMAGE",
        //   },
        //   {
        //     originalSource:
        //       "https://cdn.shopify.com/s/files/1/0558/8628/2915/products/olive_da69177d-fef8-4e6b-af48-0346946b6d4f.jpg?v=1650971345",
        //     contentType: "IMAGE",
        //   },
        // ],
        handle: "winter-gloves",
        metafields: [],
        productOptions: [
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
        tags: "new-arrival",
        status: "ACTIVE",
        title: "Winter gloves",
        variants: [
          {
            optionValues: [
              {
                optionName: "Color",
                name: "Grey",
              },
            ],
            price: 79.99,
            // file: {
            //   originalSource:
            //     "https://cdn.shopify.com/s/files/1/0558/8628/2915/products/navy_aa6195b6-2585-4b4e-b1c2-f4b8ff904b42.jpg?v=1650971345",
            // },
            // sku: "T_789_Mens_Linen_trs_NVY_32",
          },
          {
            optionValues: [
              {
                optionName: "Color",
                name: "Black",
              },
            ],
            price: 69.99,
            // file: {
            //   originalSource:
            //     "https://cdn.shopify.com/s/files/1/0558/8628/2915/products/olive_da69177d-fef8-4e6b-af48-0346946b6d4f.jpg?v=1650971345",
            // },
            // sku: "T_789_Mens_Linen_trs_NVY_34",
          },
        ],
        vendor: "EK",
      },
    },
  });
}

export { retrievProductById, unpublishProductById, addProductSet };

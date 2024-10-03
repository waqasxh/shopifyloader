import { createGraphQLClient } from "@shopify/graphql-client";

const shopifyAccessToken = process.env.SHOPIFY_ACCCESS_TOKEN;
const shopifyAGraphQLUrl = process.env.SHOPIFY_GRAPHQL_URL;

const client = createGraphQLClient({
  url: shopifyAGraphQLUrl
    ? shopifyAGraphQLUrl
    : "https://{StoreName}.myshopify.com/admin/api/2024-07/graphql.json",
  headers: {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": shopifyAccessToken
      ? shopifyAccessToken
      : "{ACCESSTOKEN}",
  },
  retries: 1,
});

async function retrievProductById(id: any): Promise<any> {
  const productQuery = `query productWithId ($productId:ID!)
      {
      product(id: $productId) {
        id
        title
        status
      }
    }`;
  const { data, errors, extensions } = await client.request(productQuery, {
    variables: {
      productId: "gid://shopify/Product/9179310391638",
    },
  });
}

// other target fields that aren't in the source should be left empty

export { retrievProductById };

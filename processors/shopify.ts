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
}
`;
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

export { retrievProductById, unpublishProductById };

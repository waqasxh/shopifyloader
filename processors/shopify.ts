import { createGraphQLClient } from "@shopify/graphql-client";
import { ProductSet, CollectionNode, Edge, Collections } from "../interfaces";

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

async function retrievAvailableCategories(): Promise<CollectionNode[]> {
  const query = `query {
    collections(first: 25) {
      edges {
        node {
          id
          title
          handle
          updatedAt
          sortOrder
        }
      }
    }
  }`;
  const { data, errors, extensions } = await client.request(query);

  const collections: Collections = data.collections;

  const collectionNodes: CollectionNode[] = collections.edges.map(
    (edge) => edge.node
  );

  return collectionNodes;
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

async function publishProductById(
  productId: string,
  publicationId: string
): Promise<any> {
  const mutation = `mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
  publishablePublish(id: $id, input: $input) {
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
      },
    },
  });
}

async function addProductSet(
  collections: any[],
  bodyHtml: string,
  files: any[],
  handle: string,
  productOptions: any[],
  status: string,
  title: string,
  variants: any[],
  vendor: string
): Promise<any> {
  const mutation = `mutation createProduct($productSet: ProductSetInput!, $synchronous: Boolean!) {
  productSet(synchronous: $synchronous, input: $productSet) {
    product {
      id
      handle
      media(first: 5) {
        nodes {
          id
          alt
          mediaContentType
          status
        }
      }
      variants(first: 5) {
        nodes {
          title
          price
          media(first: 5) {
            nodes {
              id
              alt
              mediaContentType
              status
            }
          }
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}`;
  const result = await client.request(mutation, {
    variables: {
      synchronous: true,
      productSet: {
        collections: collections,
        descriptionHtml: bodyHtml,
        files: files,
        handle: handle,
        productOptions: productOptions,
        status: status,
        title: title,
        variants: variants,
        vendor: vendor,
      },
    },
  });

  return result;
}

async function addProductSetEx(productSet: ProductSet): Promise<any> {
  const mutation = `mutation createProduct($productSet: ProductSetInput!, $synchronous: Boolean!) {
  productSet(synchronous: $synchronous, input: $productSet) {
    product {
      id
      handle
      title
    }
    userErrors {
      field
      message
    }
  }
}`;
  const result = await client.request(mutation, {
    variables: {
      synchronous: true,
      productSet: productSet,
    },
  });

  return result;
}

export {
  retrievProductById,
  unpublishProductById,
  addProductSet,
  addProductSetEx,
  publishProductById,
  retrievAvailableCategories,
};

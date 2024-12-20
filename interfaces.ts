interface ProductSet {
  id: string;
  collections: string[];
  descriptionHtml: string;
  files: Array<File>;
  handle: string;
  productOptions: Array<ProductOption>;
  status: string;
  title: string;
  variants: Array<Variant>;
  vendor: string;
}

interface ProductSetEx {
  id: string;
  productOptions: Array<ProductOption>;
  variants: Array<VariantEx>;
}

interface File {
  originalSource: string;
}

interface ProductOption {
  name: string;
  position: number;
  values: Array<ProductOptionValue>;
}

interface ProductOptionValue {
  name: string;
}

interface Variant {
  optionValues: Array<VariantOptionValue>;
  file: File;
  price: number;
  sku: string;
  compareAtPrice: number;
  inventoryQuantities: [InventoryQuantity];
  inventoryPolicy: string;
}

interface VariantEx {
  optionValues: Array<VariantOptionValue>;
  inventoryQuantities: [InventoryQuantity];
}

interface VariantOptionValue {
  optionName: string;
  name: string;
}

interface AddedProduct {
  id: string;
  handle: string;
  title: string;
}

interface FailedProduct {
  handle: string;
  title: string;
}

interface InventoryQuantity {
  locationId: string;
  name: string;
  quantity: number;
}

interface CollectionNode {
  id: string;
  title: string;
  handle: string;
  updatedAt: string;
  sortOrder: string;
}

interface Edge {
  node: CollectionNode;
}

interface Collections {
  edges: Edge[];
}

interface ProductNode {
  id: string;
  vendor: string;
  collections: {
    edges: { node: { id: string } }[];
  };
  variants: {
    edges: { node: { id: string; sku: string } }[];
  };
}

interface ProductResponse {
  data: {
    products: {
      edges: {
        node: ProductNode;
        cursor: string;
      }[];
      pageInfo: {
        hasNextPage: boolean;
      };
    };
  };
}

interface Product {
  productId: string;
  vendor: string;
  collectionIds: string;
  variantDetails: string;
}

// interface InventoryLevelInput {
//   locationId: string;
//   availableQuantity: number;
// }
// interface VariantBulk {
//   id: string;
//   inventoryQuantities: [InventoryLevelInput];
// }

export {
  ProductSet,
  ProductSetEx,
  File,
  ProductOption,
  ProductOptionValue,
  Variant,
  VariantEx,
  VariantOptionValue,
  AddedProduct,
  FailedProduct,
  InventoryQuantity,
  CollectionNode,
  Edge,
  Collections,
  ProductNode,
  ProductResponse,
  Product,
};

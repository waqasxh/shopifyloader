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

// interface EkRowItem {
//   descriptionHtml: string;
//   files: Array<string>;
//   handle: string;
//   options: Array<{
//     name: string;
//     values: Array<string>;
//   }>;
//   title: string;
//   variants: Array<{
//     options: Array<{
//       optionName: string;
//       name: string;
//     }>;
//     file: string;
//     price: number;
//     weight: number;
//     sku: string;
//     quantity: number;
//   }>;
// }

export {
  ProductSet,
  File,
  ProductOption,
  ProductOptionValue,
  Variant,
  VariantOptionValue,
  AddedProduct,
  FailedProduct,
  InventoryQuantity,
  CollectionNode,
  Edge,
  Collections,
};

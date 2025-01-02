export interface Product {
    id: number;
    name: string;
    category: string;
    stock: number;
    price: number;
    expDate: string;
  }

  export interface Report {
    category: string;
    totalProductsInStock: number;
    totalValueInStock: number;
    averagePriceInStock: number;
  }
  
export type Client = {
  id: number;
  name: string;
  last_name: string;

  locations?: Location[];

  created_at: string;
  updated_at: string;
};

export type Location = {
  id: number;
  address: string;
  postal_code: string;
  notes: string;
  client_id: number;

  created_at: string;
  updated_at: string;
};

export type OrderProduct = {
  id: number;
  amount: number;
  order_id: number;
  product_id: number;

  orders?: Order;
  products?: Product;

  created_at: string;
  updated_at: string;
}

export type OrderStatus = {
  id: number;
  name: string;

  created_at: string;
  updated_at: string;
}

export type Order = {
  id: number;
  completed_date: string;
  order_status_id: number;

  order_statuses?: OrderStatus;
  order_product?: OrderProduct[];

  created_at: string;
  updated_at: string;
};

export type Product = {
  id: number;
  name: string;
  container_key: string;

  created_at: string;
  updated_at: string;
};

export type SaleStatus = {
  id: number;
  name: string;

  created_at: string;
  updated_at: string;
}

export type Sale = {
  id: number;
  completed_date: string;
  sale_status_id: number;
  client_id: number;

  clients?: Client;
  sale_statuses?: SaleStatus;

  created_at: string;
  updated_at: string;
};

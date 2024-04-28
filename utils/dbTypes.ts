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

export type Order = {
  id: number;
  product: string;

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

export type Sale = {
  id: number;
  completed_date: string;
  sale_status_id: number;
  client_id: number;

  client?: Client;

  created_at: string;
  updated_at: string;
};

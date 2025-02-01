export interface Product {
  id: string;
  title: string;
  description: string;
  user_id: string;
  created_at: string;
}

export interface CreateProduct {
  title: string;
  description: string;
}

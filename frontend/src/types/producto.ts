// Producto type definitions based on backend API schemas

export interface ProductoBase {
  nombre: string;
  descripcion?: string | null;
  precio: number; // Converted from Decimal
  tipo_iva: number; // Converted from Decimal, default: 21.00
  es_servicio: boolean;
  codigo?: string | null;
  activo: boolean;
}

export interface ProductoCreate extends ProductoBase {
  // All fields from ProductoBase, with required fields enforced
  tipo_iva: number; // Default to 21.00
  es_servicio: boolean; // Default to false
  activo: boolean; // Default to true
}

export interface ProductoUpdate {
  nombre?: string;
  descripcion?: string | null;
  precio?: number;
  tipo_iva?: number;
  es_servicio?: boolean;
  codigo?: string | null;
  activo?: boolean;
}

export interface Producto extends ProductoBase {
  id: number;
  user_id: string;
  created_at: string; // ISO 8601 datetime string
  updated_at: string; // ISO 8601 datetime string
}

export type ProductosListResponse = Producto[];
export type ProductoResponse = Producto;
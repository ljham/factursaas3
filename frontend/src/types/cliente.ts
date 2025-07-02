// Cliente type definitions based on backend API schemas

export interface ClienteBase {
  nombre: string;
  nif?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  codigo_postal?: string | null;
  pais?: string;
  email?: string | null;
  telefono?: string | null;
}

export interface ClienteCreate extends ClienteBase {
  pais: string; // Default to "España"
}

export interface ClienteUpdate extends Partial<ClienteBase> {
  // All fields optional for partial updates
}

export interface Cliente extends ClienteBase {
  id: number;
  user_id: string;
  created_at: string; // ISO 8601 datetime string
  updated_at: string; // ISO 8601 datetime string
  pais: string; // Always present in responses
}

export type ClientesListResponse = Cliente[];
export type ClienteResponse = Cliente;
export interface RequestTypeCreate {
  name: string;
  description?: string | null;
}

export interface RequestTypeUpdate {
  name?: string | null;
  description?: string | null;
}

export interface RequestTypeResponse {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}
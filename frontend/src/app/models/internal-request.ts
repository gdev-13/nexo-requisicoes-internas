export type RequestStatus =
  | 'SOLICITADA'
  | 'EM_ANALISE'
  | 'APROVADA'
  | 'RECUSADA'
  | 'CONCLUIDA'
  | 'CANCELADA';

export type RequestPriority = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';

export interface InternalRequestCreate {
  title: string;
  description: string;
  priority: RequestPriority;
  request_type_id: number;
}

export interface InternalRequestResponse {
  id: number;
  title: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
  requester_id: number;
  request_type_name: string | null;
  request_type_id: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface RequestStatusAction {
  comment?: string | null;
}

export interface RequestHistoryResponse {
  id: number;
  request_id: number;
  user_id: number;
  previous_status: RequestStatus | null;
  new_status: RequestStatus;
  comment: string | null;
  created_at: string;
}
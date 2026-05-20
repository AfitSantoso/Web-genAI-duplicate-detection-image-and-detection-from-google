// ─── Base Response ─────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Auth ──────────────────────────────────────────────
export interface LoginRequest {
  nip: string;
  password: string;
  role: UserRole;
}

export interface LoginData {
  user_id: number;
  role: UserRole;
  name: string;
  nip: string;
  instructions: string;
}

export type UserRole = 'CMO' | 'BM' | 'AUDIT';

// ─── CMO ───────────────────────────────────────────────
export interface CmoProfile {
  id: number;
  nip: string;
  name: string;
  area: string;
}

export interface Customer {
  id: number;
  no_contract: string;
  name: string;
  fraud_status?: string;
}

export interface CreateCustomerRequest {
  name: string;
}

export interface UploadDocumentResponse {
  document_id: string;
  document_type: DocumentType;
  customer_id: number;
  detection_status: string;
  is_flagged: boolean;
}

export type DocumentType =
  | 'KTP'
  | 'NPWP'
  | 'PBB'
  | 'SLIPGAJI'
  | 'MUTASI'
  | 'LISTRIK';

export type ProofType = 'TEMPAT_TINGGAL' | 'USAHA';

export interface DocumentStatus {
  status: string;
  document_id: string;
  filename: string;
  auto_classified?: boolean;
  classification_confidence?: number;
}

export interface ProofStatus {
  status: string;
  proof_id: string;
  filename: string;
}

export interface UploadAllResponse {
  customer_id: number;
  customer_no_contract: string;
  customer_name: string;
  uploaded_by: string;
  documents: Record<string, DocumentStatus>;
  proofs: Record<string, ProofStatus>;
  summary: {
    total_uploaded: number;
    total_skipped: number;
  };
  timestamp: string;
}

export interface SkippedFile {
  filename: string;
  file_size: number;
  skip_reason: string;
  best_guess: string;
  confidence: number;
}

export interface ClassificationSummary {
  total_files: number;
  classified_count: number;
  skipped_count: number;
  types_found: string[];
  duplicate_types: string[];
  classification_time_ms: number;
}

export interface UploadBulkResponse {
  customer_id: number;
  customer_no_contract: string;
  customer_name: string;
  uploaded_by: string;
  session_id: string;
  upload_mode: string;
  classification_summary: ClassificationSummary;
  documents: Record<string, DocumentStatus>;
  proofs: Record<string, ProofStatus>;
  skipped_files: SkippedFile[];
  summary: {
    total_uploaded: number;
    total_skipped: number;
    total_files_received: number;
  };
  timestamp: string;
}

// ─── BM ────────────────────────────────────────────────
export interface BmDashboard {
  overview: {
    total_cmo: number;
    total_customers: number;
    flagged_customers: number;
    confirmed_fraud: number;
    total_fraud_documents: number;
  };
  cmo_fraud_summary: CmoFraudSummary[];
}

export interface CmoFraudSummary {
  cmo_id: number;
  cmo_name: string;
  nip: string;
  area: string;
  total_customers: number;
  flagged_count: number;
  confirmed_fraud_count: number;
  clean_count: number;
  pending_count: number;
  total_fraud_documents: number;
}

export interface FlaggedCustomer {
  id: number;
  no_contract: string;
  name: string;
  fraud_status: string;
  cmo_name: string;
  cmo_nip: string;
  score_percentage?: number;
  risk_level?: string;
}

// ─── FRIDAYS Score ─────────────────────────────────────
export interface FridaysScoreData {
  customer: {
    id: number;
    no_contract: string;
    name: string;
    fraud_status: string;
    cmo_name: string;
    cmo_nip: string;
  };
  fridays_score: FridaysScore;
  breakdown: BreakdownItem[];
  cross_reference?: CrossReference;
  related_customers?: RelatedCustomersData;
}

// ─── Fraud Network (Related Customers) ────────────────
export interface RelatedCustomerItem {
  customer_id: number;
  no_contract: string;
  customer_name: string;
  fraud_status: string;
  created_at?: string;
  cmo_name?: string;
  cmo_nip?: string;
  score_percentage?: number;
  decision?: string;
  risk_level?: string;
  any_fraud_detected?: boolean;
  total_flagged?: number;
  shared_doc_type?: string;
  shared_detail?: string;
  name_similarity?: number;
  similarity_detail?: string;
}

export interface FraudNetworkSummary {
  total_related: number;
  total_same_cmo: number;
  total_shared_documents: number;
  total_similar_name: number;
  total_flagged: number;
  total_confirmed_fraud: number;
  risk_level: string;
  risk_assessment: string;
}

export interface RelatedCustomersData {
  target_customer: Record<string, unknown>;
  related_by_cmo: RelatedCustomerItem[];
  related_by_document: RelatedCustomerItem[];
  related_by_name: RelatedCustomerItem[];
  fraud_network_summary: FraudNetworkSummary;
}

export interface CrossReference {
  has_cross_match: boolean;
  total_cross_matches: number;
  involved_cmo_names: string[];
  involved_customer_names: string[];
  summary: string;
  matches: CrossReferenceMatch[];
}

export interface CrossReferenceMatch {
  document_type: string;
  detection_status: string;
  similarity_percentage: number;
  previous_customer_name: string;
  previous_no_contract: string;
  previous_cmo_name: string;
  previous_cmo_nip: string;
  previous_fraud_status: string;
}

export interface FridaysScore {
  score: number;
  score_percentage: number;
  decision: string;
  risk_level: string | RiskLevel;
  total_flagged: number;
  any_fraud_detected: boolean;
  calculated_at: string;
  conclusion: string;
  conclusion_summary: string;
  conclusion_detail: ConclusionDetail;
}

export interface ConclusionDetail {
  is_fiktif: boolean;
  total_checked: number;
  total_fiktif: number;
  total_asli: number;
  fiktif_documents: string[];
  asli_documents: string[];
  explanation: string;
}

export interface BreakdownItem {
  component: string;
  category: 'DOCUMENT' | 'PROOF';
  weight?: number;
  raw_score?: number;
  weighted_score?: number;
  similarity_percentage: number;
  status?: string;
  detection_status?: string;
  detection_confidence?: number;
  detection_method?: string;
  matched_fields?: MatchedField[];
  comparison_summary?: string;
  fraud_patterns?: string[];
  top_similar_matches?: SimilarMatch[];
  visual_analysis?: string;
  google_lens_status?: string;
  note?: string;
  ocr_extraction_note?: string;
  previous_customer?: PreviousCustomer;
}

export interface PreviousCustomer {
  customer_id: number;
  no_contract: string;
  customer_name: string;
  cmo_name: string;
  cmo_nip: string;
  fraud_status: string;
}

export interface MatchedField {
  field: string;
  field_key: string;
  value_preview: string;
  is_match: boolean;
  similarity_percentage: number;
  detail?: string;
}

export interface SimilarMatch {
  rank: number;
  source: string;
  title: string;
  link?: string;
  thumbnail?: string;
  similarity_percentage: number;
  similarity_description: string;
}

export interface RiskLevel {
  level: string;
  color: string;
  label: string;
  description: string;
  action_required: string;
}

// ─── Review ────────────────────────────────────────────
export interface ReviewRequest {
  review_status: 'FLAGGED' | 'CLEAN' | 'CONFIRMED_FRAUD';
  review_notes?: string;
}

export interface ReviewHistory {
  id: number;
  review_status: string;
  review_notes: string;
  reviewed_by: string;
  reviewed_at: string;
}

// ─── AUDIT ─────────────────────────────────────────────
export interface AuditDashboard {
  audit_user: {
    id: number;
    name: string;
    nip: string;
  };
  overview: {
    total_cmo: number;
    total_cmo_with_fraud: number;
    total_customers: number;
    total_fraud_documents: number;
    flagged_customers: number;
    confirmed_fraud: number;
  };
  cmo_fraud_summary: CmoFraudSummary[];
}

export interface AuditCmoCustomer {
  customer_id: number;
  no_contract: string;
  customer_name: string;
  fraud_status: string;
  score_percentage: number;
  decision: string;
  risk_level: string;
  total_flagged: number;
  any_fraud_detected: boolean;
  fridays_calculated_at: string;
}

export interface AuditCmoCustomers {
  cmo: {
    id: number;
    name: string;
    nip: string;
    area: string;
  };
  total_customers: number;
  customers: AuditCmoCustomer[];
}

// ─── Detect Duplicate (Legacy) ─────────────────────────
export interface DetectDuplicateResponse {
  filename: string;
  document_type: string;
  detection_result: {
    status: string;
    confidence: number;
    matched_document_id: string;
  };
}

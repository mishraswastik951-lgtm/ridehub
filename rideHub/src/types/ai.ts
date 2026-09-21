export type ImageAngle = "front" | "rear" | "left" | "right" | "dashboard" | "closeup";

export type DamageType = 
  | "scratch" 
  | "dent" 
  | "crack" 
  | "broken_part" 
  | "missing_part" 
  | "paint_chip" 
  | "tyre_wear" 
  | "other";

export type DamageSeverity = "minor" | "moderate" | "severe";

// Bounding box in Gemini normalized format [ymin, xmin, ymax, xmax] (0 - 1000 scale)
export type BoundingBox = [number, number, number, number];

export interface DamageFinding {
  id: string;
  type: DamageType;
  severity: DamageSeverity;
  location: string;
  description: string;
  confidence: number;
  box: BoundingBox;
}

export interface ImageQuality {
  ok: boolean;
  problems: Array<"blur" | "dark" | "glare" | "wrong_angle" | "not_a_vehicle">;
}

export interface QualityCheckResult {
  isDark: boolean;
  isBlurred: boolean;
  brightness: number;
  score: number;
}

export interface ImageAnalysisResult {
  angle: ImageAngle;
  quality: ImageQuality;
  findings: DamageFinding[];
}

export interface DamageAnalyzeResponse {
  bookingId: string;
  phase: "pickup" | "return";
  vehicleType: string;
  results: ImageAnalysisResult[];
  overallSummary: string;
}

export interface DamageComparisonResult {
  newFindings: DamageFinding[];
  unchanged: DamageFinding[];
  verdict: "no_new_damage" | "review_needed";
  indicativeRepairRangeInr: { min: number; max: number } | null;
  disclaimer: string;
}

export interface ShopkeeperInsight {
  title: string;
  detail: string;
  impact: string;
  action: string;
}

export type InspectionStatus = 
  | "pickup_photos" 
  | "ride" 
  | "return_photos" 
  | "ai_comparison" 
  | "shopkeeper_review" 
  | "customer_response" 
  | "resolved";

export interface InspectionRecord {
  bookingId: string;
  pickupFindings: DamageFinding[];
  returnFindings?: DamageFinding[];
  newFindings?: DamageFinding[];
  verdict?: "no_new_damage" | "review_needed";
  indicativeRepairRangeInr?: { min: number; max: number } | null;
  shopkeeperDeductionProposal?: number;
  shopkeeperNotes?: string;
  customerDisputed?: boolean;
  customerDisputeComment?: string;
  status: InspectionStatus;
  pickupSignedAt?: string;
  resolvedAt?: string;
}

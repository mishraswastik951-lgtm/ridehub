// Inspection state management store for RideHub AI Damage Detection
import { InspectionRecord, DamageFinding, ImageAngle, DamageComparisonResult } from "../types/ai";

const STORAGE_KEY = "ridehub_inspection_records";

const INITIAL_RECORDS: Record<string, InspectionRecord> = {
  "BK-1001": {
    bookingId: "BK-1001",
    status: "pickup_photos",
    pickupFindings: [
      {
        id: "f-p1",
        type: "scratch",
        severity: "minor",
        location: "Lower Right Side Panel",
        description: "Surface scratch 4cm long on gloss finish",
        confidence: 0.88,
        box: [450, 600, 520, 850],
      },
    ],
    pickupSignedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  "BK-1002": {
    bookingId: "BK-1002",
    status: "ai_comparison",
    pickupFindings: [],
    returnFindings: [
      {
        id: "f-r1",
        type: "dent",
        severity: "moderate",
        location: "Front Mudguard",
        description: "2-inch deep indentation near headlamp mount",
        confidence: 0.92,
        box: [200, 300, 380, 550],
      },
    ],
    newFindings: [
      {
        id: "f-r1",
        type: "dent",
        severity: "moderate",
        location: "Front Mudguard",
        description: "2-inch deep indentation near headlamp mount",
        confidence: 0.92,
        box: [200, 300, 380, 550],
      },
    ],
    verdict: "review_needed",
    indicativeRepairRangeInr: { min: 1200, max: 2500 },
    pickupSignedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
};

export class InspectionStore {
  private static getRecords(): Record<string, InspectionRecord> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_RECORDS;
    } catch {
      return INITIAL_RECORDS;
    }
  }

  private static saveRecords(records: Record<string, InspectionRecord>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error("Failed to save inspection records", e);
    }
  }

  public static getRecord(bookingId: string): InspectionRecord {
    const records = this.getRecords();
    if (!records[bookingId]) {
      records[bookingId] = {
        bookingId,
        status: "pickup_photos",
        pickupFindings: [],
      };
      this.saveRecords(records);
    }
    return records[bookingId];
  }

  public static savePickupBaseline(
    bookingId: string,
    findings: DamageFinding[],
    imageUrls?: Record<ImageAngle, string>
  ): InspectionRecord {
    const records = this.getRecords();
    const record: InspectionRecord = records[bookingId] || {
      bookingId,
      status: "pickup_photos",
      pickupFindings: [],
    };

    record.pickupFindings = findings;
    record.status = "ride";
    record.pickupSignedAt = new Date().toISOString();
    if (imageUrls) {
      (record as any).pickupImageUrls = imageUrls;
    }

    records[bookingId] = record;
    this.saveRecords(records);
    return record;
  }

  public static saveReturnComparison(
    bookingId: string,
    returnFindings: DamageFinding[],
    comparison: DamageComparisonResult,
    imageUrls?: Record<ImageAngle, string>
  ): InspectionRecord {
    const records = this.getRecords();
    const record: InspectionRecord = records[bookingId] || {
      bookingId,
      status: "return_photos",
      pickupFindings: [],
    };

    record.returnFindings = returnFindings;
    record.newFindings = comparison.newFindings;
    record.verdict = comparison.verdict;
    record.indicativeRepairRangeInr = comparison.indicativeRepairRangeInr;
    record.status = comparison.verdict === "review_needed" ? "shopkeeper_review" : "resolved";
    if (imageUrls) {
      (record as any).returnImageUrls = imageUrls;
    }

    records[bookingId] = record;
    this.saveRecords(records);
    return record;
  }

  public static updateShopkeeperReview(
    bookingId: string,
    deductionProposal: number,
    notes: string,
    acceptedFindingIds: string[]
  ): InspectionRecord {
    const records = this.getRecords();
    const record = records[bookingId];
    if (!record) throw new Error("Record not found");

    record.shopkeeperDeductionProposal = deductionProposal;
    record.shopkeeperNotes = notes;
    record.status = deductionProposal > 0 ? "customer_response" : "resolved";
    if (deductionProposal === 0) {
      record.resolvedAt = new Date().toISOString();
    }

    records[bookingId] = record;
    this.saveRecords(records);
    return record;
  }

  public static updateCustomerResponse(
    bookingId: string,
    accept: boolean,
    disputeComment?: string
  ): InspectionRecord {
    const records = this.getRecords();
    const record = records[bookingId];
    if (!record) throw new Error("Record not found");

    if (accept) {
      record.customerDisputed = false;
      record.status = "resolved";
      record.resolvedAt = new Date().toISOString();
    } else {
      record.customerDisputed = true;
      record.customerDisputeComment = disputeComment || "Customer disputed the proposed deduction.";
      record.status = "shopkeeper_review"; // Bounces back for shopkeeper review
    }

    records[bookingId] = record;
    this.saveRecords(records);
    return record;
  }
}

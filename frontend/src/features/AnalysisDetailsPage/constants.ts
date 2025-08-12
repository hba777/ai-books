export type ReviewTypeKey =
  | "FactCheckingReview"
  | "FederalUnityReview"
  | "ForeignRelationsReview"
  | "HistoricalNarrativeReview"
  | "InstitutionalIntegrityReview"
  | "NationalSecurityReview"
  | "RhetoricToneReview";

export const reviewTypeOptions: { key: ReviewTypeKey; title: string }[] = [
  { key: "FactCheckingReview", title: "Fact Checking Review" },
  { key: "FederalUnityReview", title: "Federal Unity Review" },
  { key: "ForeignRelationsReview", title: "Foreign Relations Review" },
  { key: "HistoricalNarrativeReview", title: "Historical Narrative Review" },
  { key: "InstitutionalIntegrityReview", title: "Institutional Integrity Review" },
  { key: "NationalSecurityReview", title: "National Security Review" },
  { key: "RhetoricToneReview", title: "Rhetoric & Tone Review" },
];



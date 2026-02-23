// ─── Pagination ─────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
}

// ─── Auth ────────────────────────────────────────────────────────────
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserSummary;
}

export interface UserSummary {
  id: string;
  lastName: string;
  firstName: string;
  role: string;
  companyId: string | null;
  avatarUrl: string | null;
}

// ─── Company ─────────────────────────────────────────────────────────
export interface Company {
  id: string;
  companyName: string;
  companyNameKana?: string;
  companyType: string;
  corporateNumber?: string;
  representative?: string;
  postalCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive: boolean;
  settings?: CompanySettings | null;
  createdAt: string;
}

export interface CompanySettings {
  id: string;
  companyId: string;
  defaultReportMode?: string;
  allowWorkerModeSwitch?: boolean;
  requirePhoto?: boolean;
  requireSafetyRecord?: boolean;
  gpsEnabled?: boolean;
  gpsWorkerCanDisable?: boolean;
  geofenceEnabled?: boolean;
  geofenceDefaultRadiusM?: number;
  matchingEnabled?: boolean;
  autoApproveApplications?: boolean;
  standardWorkHours?: number;
  overtimeThresholdHours?: number;
}

// ─── User ────────────────────────────────────────────────────────────
export interface User {
  id: string;
  companyId: string | null;
  lineUserId?: string;
  lastName: string;
  firstName: string;
  lastNameKana?: string;
  firstNameKana?: string;
  email?: string;
  phone?: string;
  role: string;
  availability?: string;
  avatarUrl?: string;
  isIndividual?: boolean;
  defaultDailyRate?: number;
  createdAt: string;
}

// ─── Worker ──────────────────────────────────────────────────────────
export interface WorkerProfile {
  id: string;
  userId: string;
  experienceYears?: number;
  skillLevel?: string;
  specialties?: string;
  careerSummary?: string;
  preferredArea?: string;
  maxCommuteKm?: number;
  hasVehicle?: boolean;
  hasOwnTools?: boolean;
  desiredDailyMin?: number;
  desiredDailyMax?: number;
  avgRating?: number;
  totalReviews?: number;
  totalProjects?: number;
}

export interface WorkerSkill {
  id: string;
  workTypeId: string;
  workType?: WorkType;
  yearsOfExperience?: number;
  selfRating?: number;
}

export interface WorkerLicense {
  id: string;
  licenseId: string;
  license?: LicenseMaster;
  licenseNumber?: string;
  issuedDate?: string;
  expiryDate?: string;
  isVerified?: boolean;
}

export interface WorkerEvaluation {
  id: string;
  evaluatorId: string;
  workerId: string;
  projectId: string;
  ratingSkill: number;
  ratingSpeed: number;
  ratingAttitude: number;
  ratingSafety: number;
  ratingCommunication: number;
  comment?: string;
  createdAt: string;
}

export interface WorkerAvailability {
  id: string;
  userId: string;
  targetDate: string;
  status: string;
}

// ─── Masters ─────────────────────────────────────────────────────────
export interface WorkType {
  id: string;
  workTypeName: string;
  parentId?: string | null;
  children?: WorkType[];
}

export interface StructureMaster {
  id: string;
  structureName: string;
}

export interface LicenseMaster {
  id: string;
  licenseName: string;
  category?: string;
}

export interface AccountMaster {
  id: string;
  accountCode: string;
  accountName: string;
  category?: string;
}

// ─── Project ─────────────────────────────────────────────────────────
export interface Project {
  id: string;
  companyId: string;
  projectCode?: string;
  projectName: string;
  description?: string;
  status: string;
  siteName?: string;
  sitePrefecture?: string;
  siteCity?: string;
  siteAddress?: string;
  siteLat?: number;
  siteLng?: number;
  geofenceRadiusM?: number;
  scheduledStart?: string;
  scheduledEnd?: string;
  contractAmount?: number;
  estimatedCost?: number;
  createdAt: string;
}

export interface ProjectPhase {
  id: string;
  projectId: string;
  phaseName: string;
  phaseOrder: number;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface ProjectStaffing {
  id: string;
  projectId: string;
  targetDate: string;
  workTypeId?: string;
  requiredCount: number;
  confirmedCount: number;
  workType?: WorkType;
}

export interface ProjectAssignment {
  id: string;
  projectId: string;
  userId: string;
  targetDate: string;
  status: string;
  dailyRate?: number;
  user?: User;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  docType?: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
}

// ─── Report ──────────────────────────────────────────────────────────
export interface DailyReport {
  id: string;
  projectId: string;
  workerId: string;
  reportDate: string;
  inputMode: string;
  status: string;
  clockIn?: string;
  clockOut?: string;
  breakMinutes?: number;
  workMinutes?: number;
  manDays?: number;
  overtimeMinutes?: number;
  workContent?: string;
  progressPct?: number;
  weather?: string;
  project?: Project;
  worker?: User;
  costItems?: ReportCostItem[];
  photos?: ReportPhoto[];
  safetyRecords?: SafetyRecord[];
  breakLogs?: BreakLog[];
  createdAt: string;
}

export interface ReportCostItem {
  id: string;
  reportId: string;
  costType: string;
  itemName: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  amount: number;
}

export interface ReportPhoto {
  id: string;
  reportId: string;
  photoUrl: string;
  photoType?: string;
  caption?: string;
}

export interface SafetyRecord {
  id: string;
  reportId: string;
  projectId: string;
  kyTheme?: string;
  hazardDescription?: string;
  countermeasure?: string;
  slogan?: string;
}

export interface BreakLog {
  id: string;
  reportId: string;
  breakStart: string;
  breakEnd?: string;
  durationMinutes?: number;
}

// ─── Geolocation ─────────────────────────────────────────────────────
export interface LocationLog {
  id: string;
  userId: string;
  latitude?: number;
  longitude?: number;
  accuracyM?: number;
  eventType: string;
  projectId?: string;
  recordedAt: string;
}

export interface GeofenceEvent {
  id: string;
  userId: string;
  projectId: string;
  eventType: string;
  eventAt: string;
  latitude?: number;
  longitude?: number;
  distanceM?: number;
}

export interface GeofenceCheckResponse {
  isInsideGeofence: boolean;
  distanceMeters: number | null;
  projectId: string | null;
  projectName: string | null;
  event: any | null;
  message?: string;
}

// ─── Matching Demand ─────────────────────────────────────────────────
export interface DemandPosting {
  id: string;
  companyId: string;
  projectId?: string;
  siteName: string;
  sitePrefecture: string;
  siteCity: string;
  siteAddress?: string;
  contractType: string;
  workTypeId: string;
  workType?: WorkType;
  workDateStart: string;
  workDateEnd: string;
  requiredCount: number;
  confirmedCount: number;
  dailyRateMin?: number;
  dailyRateMax?: number;
  fixedPrice?: number;
  status: string;
  description?: string;
  notes?: string;
  providesParking?: boolean;
  providesTools?: boolean;
  providesMeals?: boolean;
  ccusRequired?: boolean;
  company?: Company;
  createdAt: string;
}

export interface DemandApplication {
  id: string;
  demandPostingId: string;
  applicantId: string;
  applicantCompanyId?: string;
  status: string;
  proposedRate?: number;
  availableCount?: number;
  message?: string;
  applicant?: User;
  createdAt: string;
}

export interface DemandMessage {
  id: string;
  demandPostingId: string;
  senderId: string;
  content: string;
  sender?: User;
  createdAt: string;
}

// ─── Matching Supply ─────────────────────────────────────────────────
export interface SupplyPosting {
  id: string;
  userId: string;
  companyId?: string;
  workTypeId: string;
  workType?: WorkType;
  contractType: string;
  desiredDailyRate?: number;
  availableStart: string;
  availableEnd: string;
  availablePrefecture: string;
  availableArea?: string;
  skillLevel?: string;
  experienceYears?: number;
  title?: string;
  description?: string;
  status: string;
  user?: User;
  createdAt: string;
}

export interface SupplyInquiry {
  id: string;
  supplyPostingId: string;
  inquirerId: string;
  inquirerCompanyId?: string;
  status: string;
  message?: string;
  inquirer?: User;
  createdAt: string;
}

export interface SupplyMessage {
  id: string;
  supplyPostingId: string;
  senderId: string;
  content: string;
  sender?: User;
  createdAt: string;
}

// ─── Matching Contract ───────────────────────────────────────────────
export interface MatchContract {
  id: string;
  demandPostingId?: string;
  supplyPostingId?: string;
  clientCompanyId?: string;
  workerUserId?: string;
  workerCompanyId?: string;
  contractType?: string;
  status: string;
  workDateStart?: string;
  workDateEnd?: string;
  agreedRate?: number;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  demandPosting?: DemandPosting;
  supplyPosting?: SupplyPosting;
  clientCompany?: Company;
  workerUser?: User;
  reviews?: MatchReview[];
  createdAt: string;
}

export interface MatchReview {
  id: string;
  contractId: string;
  reviewerId: string;
  revieweeId: string;
  reviewType: string;
  rating: number;
  comment?: string;
  reviewer?: User;
  reviewee?: User;
  createdAt: string;
}

export interface DashboardResponse {
  weekStart: string;
  weekEnd: string;
  dailySummary: {
    date: string;
    required: number;
    confirmed: number;
    shortage: number;
    surplus: number;
  }[];
  openDemands: number;
  activeContracts: number;
  staffingDetails: any[];
}

export interface KpiResponse {
  contracts: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    cancelRate: number;
  };
  matching: { avgTimeToMatchHours: number | null };
  reviews: { avgRating: number | null; totalReviews: number };
  demand: { total: number; open: number; filled: number; fillRate: number };
}

// ─── Accounting ──────────────────────────────────────────────────────
export interface Invoice {
  id: string;
  companyId: string;
  clientCompanyId: string;
  projectId?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  lines?: InvoiceLine[];
  payments?: PaymentReceived[];
  createdAt: string;
}

export interface InvoiceLine {
  id: string;
  invoiceId: string;
  lineOrder: number;
  description: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  amount: number;
}

export interface PaymentReceived {
  id: string;
  invoiceId: string;
  paymentDate: string;
  amount: number;
  paymentMethod?: string;
}

export interface Payroll {
  id: string;
  companyId: string;
  workerId: string;
  periodStart: string;
  periodEnd: string;
  paymentDate?: string;
  status: string;
  grossAmount: number;
  withholdingTax?: number;
  deductions?: number;
  netAmount: number;
  worker?: User;
  lines?: PayrollLine[];
  createdAt: string;
}

export interface PayrollLine {
  id: string;
  payrollId: string;
  lineOrder: number;
  description: string;
  amount: number;
}

export interface CostLedgerEntry {
  id: string;
  projectId: string;
  costCategory: string;
  accountId?: string;
  amount: number;
  transactionDate: string;
  description?: string;
}

export interface CostSummary {
  projectId: string;
  totalCost: number;
  byCategory: { category: string; total: number }[];
}

// ─── Custom Fields ───────────────────────────────────────────────────
export interface CustomFieldDef {
  id: string;
  companyId: string;
  targetType: string;
  fieldLabel: string;
  fieldKey: string;
  inputType: string;
  options?: { value: string; label: string }[] | null;
  isRequired: boolean;
  sortOrder: number;
  placeholder?: string;
  helpText?: string;
}

export interface CustomFieldVal {
  id: string;
  fieldDefId: string;
  targetType: string;
  targetId: string;
  fieldValue: string | null;
  fieldDef?: CustomFieldDef;
}

// ─── Notifications ───────────────────────────────────────────────────
export interface NotificationLog {
  id: string;
  userId: string;
  notificationType: string;
  title: string;
  body?: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

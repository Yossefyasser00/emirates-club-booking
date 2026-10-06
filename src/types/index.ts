export type CourtType = 'FIVE_A_SIDE' | 'SEVEN_A_SIDE' | 'PADEL' | string;

export interface Court {
  id: string;
  name: string;
  type: CourtType;
  pricePerHour: number;
  peakPricePerHour: number;
  description: string;
  image: string;
  features: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'PENDING' | 'BLOCKED';

export interface Slot {
  courtId: string;
  courtName: string;
  date: string;
  hourIndex: number;
  startTime: string;
  endTime: string;
  isPeak: boolean;
  price: number;
  status: SlotStatus;
  blockReason?: string | null;
  booking?: {
    bookingCode: string;
    customerName: string;
    status: string;
    durationHours: number;
    isRecurring?: boolean;
  };
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REJECTED';

export type PaymentMethod = 'VODAFONE_CASH' | 'INSTAPAY' | 'CASH_ON_ARRIVAL';
export type PaymentStatus = 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';

export interface Payment {
  id: string;
  bookingId: string;
  method: PaymentMethod;
  amount: number;
  transactionReference?: string | null;
  receiptImage?: string | null;
  status: PaymentStatus;
  verifiedAt?: string | null;
  createdAt?: string;
}

export interface Booking {
  id: string;
  bookingCode: string;
  courtId: string;
  court?: Court;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  totalAmount: number;
  depositAmount: number;
  discountAmount: number;
  promoCode?: string | null;
  status: BookingStatus;
  isRecurring: boolean;
  recurringPattern?: string | null;
  notes?: string | null;
  cancellationReason?: string | null;
  payment?: Payment | null;
  createdAt: string;
  updatedAt?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  discountAmount: number;
  minBookingHours: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt?: string;
}

export interface Complaint {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerPhone: string;
  bookingCode?: string | null;
  subject: string;
  message: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  adminReply?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Settings {
  id: string;
  clubName: string;
  vodafoneCashNumber: string;
  instaPayHandle: string;
  depositPercentage: number;
  fixedDepositAmount: number;
  useFixedDeposit: boolean;
  openHour: number;
  closeHour: number;
  cancellationHoursLimit: number;
  autoApprove: boolean;
  announcement?: string | null;
  footballCategoryTitle?: string | null;
  footballCategoryDesc?: string | null;
  footballCategoryImage?: string | null;
  padelCategoryTitle?: string | null;
  padelCategoryDesc?: string | null;
  padelCategoryImage?: string | null;
}


export interface AnalyticsSummary {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  todayBookingsCount: number;
  todayBookings: Booking[];
  totalRevenue: number;
  totalDepositsCollected: number;
  totalRemainingAtField: number;
  activeComplaintsCount: number;
  courtsStats: {
    id: string;
    name: string;
    type: CourtType;
    totalBookings: number;
    revenue: number;
    isActive: boolean;
  }[];
  statusCounts: {
    CONFIRMED: number;
    PENDING: number;
    CANCELLED: number;
    COMPLETED: number;
  };
}
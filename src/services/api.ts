import {
  Court,
  Slot,
  Booking,
  PromoCode,
  Complaint,
  Settings,
  AnalyticsSummary,
} from '../types';

const API_BASE = '/api';

const getAuthHeaders = (extra: Record<string, string> = {}): Record<string, string> => {
  const token = localStorage.getItem('club_admin_token');
  const headers: Record<string, string> = { ...extra };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Courts
  getCourts: async (all = false): Promise<Court[]> => {
    const res = await fetch(`${API_BASE}/courts${all ? '?all=true' : ''}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch courts');
    return res.json();
  },
  getCourt: async (id: string): Promise<Court> => {
    const res = await fetch(`${API_BASE}/courts/${id}`);
    if (!res.ok) throw new Error('Failed to fetch court');
    return res.json();
  },
  createCourt: async (data: Partial<Court>): Promise<Court> => {
    const res = await fetch(`${API_BASE}/courts`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create court');
    return res.json();
  },
  updateCourt: async (id: string, data: Partial<Court>): Promise<Court> => {
    const res = await fetch(`${API_BASE}/courts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update court');
    return res.json();
  },
  toggleCourt: async (id: string): Promise<Court> => {
    const res = await fetch(`${API_BASE}/courts/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to toggle court');
    return res.json();
  },
  deleteCourt: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/courts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete court');
    return res.json();
  },

  // Slots & Timeline
  getSlots: async (courtId: string, date: string): Promise<Slot[]> => {
    const res = await fetch(`${API_BASE}/slots?courtId=${courtId}&date=${date}`);
    if (!res.ok) throw new Error('Failed to fetch slots');
    const data = await res.json();
    return Array.isArray(data) ? data : data.slots || [];
  },
  getTimeline: async (date: string): Promise<Array<{ court: Court; slots: Slot[] }>> => {
    const res = await fetch(`${API_BASE}/slots/timeline?date=${date}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch timeline');
    return res.json();
  },
  blockSlot: async (courtId: string, date: string, startTime: string, blockReason?: string): Promise<{ success: boolean; slot: Slot }> => {
    const res = await fetch(`${API_BASE}/slots/block`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ courtId, date, startTime, blockReason }),
    });
    if (!res.ok) throw new Error('Failed to block slot');
    return res.json();
  },
  unblockSlot: async (courtId: string, date: string, startTime: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/slots/unblock`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ courtId, date, startTime }),
    });
    if (!res.ok) throw new Error('Failed to unblock slot');
    return res.json();
  },

  // Bookings
  createBooking: async (bookingData: any): Promise<{ booking: Booking }> => {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create booking');
    return data;
  },
  lookupBookings: async (query: string): Promise<Booking[]> => {
    const res = await fetch(`${API_BASE}/bookings/lookup?query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to lookup bookings');
    return res.json();
  },
  getBookings: async (params?: { status?: string; courtId?: string; date?: string; search?: string }): Promise<{ bookings: Booking[]; totalCount: number; totalPages: number }> => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/bookings?${query}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
  },
  getAllBookings: async (params?: { status?: string; courtId?: string; date?: string }): Promise<Booking[]> => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/bookings?${query}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch bookings');
    const data = await res.json();
    return Array.isArray(data) ? data : data.bookings || [];
  },
  updateBookingStatus: async (id: string, status: string, notes?: string): Promise<Booking> => {
    const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status, notes }),
    });
    if (!res.ok) throw new Error('Failed to update booking status');
    return res.json();
  },
  cancelBooking: async (id: string, phone: string, reason?: string): Promise<{ success: boolean; message: string; booking: Booking }> => {
    const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to cancel booking');
    return data;
  },
  deleteBooking: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/bookings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete booking');
    return res.json();
  },

  // Payments
  uploadReceipt: async (formData: FormData): Promise<any> => {
    const res = await fetch(`${API_BASE}/payments/upload-receipt`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload receipt');
    return res.json();
  },
  verifyPayment: async (paymentId: string, status: 'VERIFIED' | 'REJECTED'): Promise<any> => {
    const res = await fetch(`${API_BASE}/payments/${paymentId}/verify`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to verify payment');
    return res.json();
  },

  // Promos
  validatePromo: async (code: string, durationHours: number, totalAmount: number) => {
    const res = await fetch(`${API_BASE}/promos/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, totalAmount, durationHours }),
    });
    return res.json();
  },
  getPromos: async (): Promise<PromoCode[]> => {
    const res = await fetch(`${API_BASE}/promos`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch promos');
    return res.json();
  },
  createPromo: async (data: Partial<PromoCode>): Promise<PromoCode> => {
    const res = await fetch(`${API_BASE}/promos`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create promo');
    return res.json();
  },
  deletePromo: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/promos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete promo');
    return res.json();
  },

  // Complaints
  createComplaint: async (data: { customerName: string; customerPhone: string; bookingCode?: string; subject: string; message: string }): Promise<{ success: boolean; message: string; complaint: Complaint }> => {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok) throw new Error(resData.error || 'Failed to submit complaint');
    return resData;
  },
  submitComplaint: async (data: any) => {
    return api.createComplaint(data);
  },
  getMyComplaints: async (phone: string): Promise<Complaint[]> => {
    const res = await fetch(`${API_BASE}/complaints/my?phone=${encodeURIComponent(phone)}`);
    if (!res.ok) throw new Error('Failed to fetch complaints');
    return res.json();
  },
  getComplaints: async (status?: string): Promise<Complaint[]> => {
    const res = await fetch(`${API_BASE}/complaints${status ? `?status=${status}` : ''}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch complaints');
    return res.json();
  },
  getAllComplaints: async (): Promise<Complaint[]> => {
    return api.getComplaints();
  },
  updateComplaint: async (id: string, data: { status?: string; adminReply?: string }): Promise<Complaint> => {
    const res = await fetch(`${API_BASE}/complaints/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update complaint');
    return res.json();
  },
  deleteComplaint: async (id: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_BASE}/complaints/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete complaint');
    return res.json();
  },

  // Settings
  getSettings: async (): Promise<Settings> => {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },
  updateSettings: async (data: Partial<Settings>): Promise<Settings> => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // Analytics
  getAnalytics: async (): Promise<AnalyticsSummary> => {
    const res = await fetch(`${API_BASE}/analytics`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },
};
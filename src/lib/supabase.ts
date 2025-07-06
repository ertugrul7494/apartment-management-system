import { createClient } from '@supabase/supabase-js'

// Supabase project bilgileri
const supabaseUrl = 'https://kfmabzoqkvwhlkujsvwf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmbWFiem9xa3Z3aGxrdWpzdndmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzIyMDIsImV4cCI6MjA2NzQwODIwMn0.chgx1k9PTprocLafRA18XmjW1aEA-qoTvy8bBs77-kc'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database Types
export interface Apartment {
  id: number;
  apartment_number: string;
  owner_name: string;
  phone?: string;
  email?: string;
  floor?: number;
  apartment_size?: number;
  monthly_fee: number;
  created_at?: string;
  updated_at?: string;
}

export interface Payment {
  id: number;
  apartment_id: number;
  amount: number;
  paid_amount: number;
  status: 'paid' | 'partial' | 'pending';
  month: string;
  due_date: string;
  paid_date?: string;
  payment_method?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// API Functions
export const apartmentApi = {
  // Tüm daireleri getir
  getAll: async (): Promise<Apartment[]> => {
    const { data, error } = await supabase
      .from('apartments')
      .select('*')
      .order('apartment_number');
    
    if (error) throw error;
    return data || [];
  },

  // Yeni daire ekle
  create: async (apartment: Omit<Apartment, 'id' | 'created_at' | 'updated_at'>): Promise<Apartment> => {
    const { data, error } = await supabase
      .from('apartments')
      .insert([apartment])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Daire güncelle
  update: async (id: number, apartment: Partial<Apartment>): Promise<Apartment> => {
    const { data, error } = await supabase
      .from('apartments')
      .update(apartment)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Daire sil
  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('apartments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

export const paymentApi = {
  // Tüm ödemeleri getir
  getAll: async (): Promise<Payment[]> => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('month', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Ödeme ekle
  create: async (payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>): Promise<Payment> => {
    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Ödeme güncelle
  update: async (id: number, payment: Partial<Payment>): Promise<Payment> => {
    const { data, error } = await supabase
      .from('payments')
      .update(payment)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Ödeme sil
  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

import { useState, useEffect } from 'react';
import { Building, Home, DollarSign, BarChart, MessageCircle, Menu, X } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import ApartmentManagement from './components/ApartmentManagement';
import PaymentManagement from './components/PaymentManagement';
import Reports from './components/Reports';
import WhatsAppMessages from './components/WhatsAppMessages';
import AdvancePayments from './components/AdvancePayments';
import { apartmentApi, paymentApi } from './lib/supabase';

// Legacy interfaces for compatibility with existing components
interface LegacyApartment {
  id: string;
  number: string;
  floor: number;
  owner: string;
  phone: string;
  email: string;
  createdAt: string;
}

interface LegacyPayment {
  id: string;
  apartmentId: string;
  apartmentNumber: string;
  owner: string;
  month: string;
  amount: number;
  status: 'paid' | 'pending' | 'partial';
  paidAmount: number;
  paidDate?: string;
  dueDate: string;
  isAdvancePayment?: boolean;
  advanceMonths?: string[];
}

// Supabase interfaces
interface Apartment {
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

interface Payment {
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

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apartments, setApartments] = useState<LegacyApartment[]>([]);
  const [payments, setPayments] = useState<LegacyPayment[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = new Date().toISOString().slice(0, 7);

  // Converter functions between Supabase and Legacy formats
  const convertToLegacyApartment = (supabaseApt: Apartment): LegacyApartment => ({
    id: supabaseApt.id.toString(),
    number: supabaseApt.apartment_number,
    floor: supabaseApt.floor || 1,
    owner: supabaseApt.owner_name,
    phone: supabaseApt.phone || '',
    email: supabaseApt.email || '',
    createdAt: supabaseApt.created_at || new Date().toISOString(),
  });

  const convertFromLegacyApartment = (legacyApt: Omit<LegacyApartment, 'id' | 'createdAt'>): Omit<Apartment, 'id' | 'created_at' | 'updated_at'> => ({
    apartment_number: legacyApt.number,
    owner_name: legacyApt.owner,
    phone: legacyApt.phone,
    email: legacyApt.email,
    floor: legacyApt.floor,
    monthly_fee: 500, // Default monthly fee
  });

  const convertToLegacyPayment = (supabasePayment: Payment, apartments: LegacyApartment[]): LegacyPayment => {
    const apartment = apartments.find(apt => apt.id === supabasePayment.apartment_id.toString());
    return {
      id: supabasePayment.id.toString(),
      apartmentId: supabasePayment.apartment_id.toString(),
      apartmentNumber: apartment?.number || '',
      owner: apartment?.owner || '',
      month: supabasePayment.month,
      amount: supabasePayment.amount,
      status: supabasePayment.status,
      paidAmount: supabasePayment.paid_amount,
      paidDate: supabasePayment.paid_date,
      dueDate: supabasePayment.due_date,
    };
  };

  const convertFromLegacyPayment = (legacyPayment: Omit<LegacyPayment, 'id'>): Omit<Payment, 'id' | 'created_at' | 'updated_at'> => ({
    apartment_id: parseInt(legacyPayment.apartmentId),
    amount: legacyPayment.amount,
    paid_amount: legacyPayment.paidAmount,
    status: legacyPayment.status,
    month: legacyPayment.month,
    due_date: legacyPayment.dueDate,
    paid_date: legacyPayment.paidDate,
  });

  // Load data from Supabase on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      // If not authenticated, at least stop loading
      setDataLoading(false);
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setDataLoading(true);
      setError(null);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Bağlantı zaman aşımı (15 saniye)')), 15000)
      );
      
      const dataPromise = Promise.all([
        apartmentApi.getAll(),
        paymentApi.getAll()
      ]);
      
      const [apartmentsData, paymentsData] = await Promise.race([dataPromise, timeoutPromise]) as [any[], any[]];
      
      const legacyApartments = apartmentsData.map(convertToLegacyApartment);
      const legacyPayments = paymentsData.map(payment => convertToLegacyPayment(payment, legacyApartments));
      
      setApartments(legacyApartments);
      setPayments(legacyPayments);
      
      // Backup to localStorage
      localStorage.setItem('apartments', JSON.stringify(legacyApartments));
      localStorage.setItem('payments', JSON.stringify(legacyPayments));
      
    } catch (error) {
      console.error('❌ Veri yükleme hatası:', error);
      
      // Check specific error types
      if (error instanceof Error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          setError('Supabase tabloları bulunamadı. Lütfen veritabanı kurulumunu kontrol edin.');
        } else if (error.message.includes('Invalid API key') || error.message.includes('JWT')) {
          setError('Supabase API anahtarı geçersiz. Lütfen konfigürasyonu kontrol edin.');
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          setError('İnternet bağlantısı sorunu. Lütfen bağlantınızı kontrol edin.');
        } else {
          setError(`Supabase bağlantı hatası: ${error.message}`);
        }
      } else {
        setError('Bilinmeyen bir hata oluştu. Yerel verilerle devam ediliyor.');
      }
      
      // Fallback to localStorage as backup
      const savedApartments = localStorage.getItem('apartments');
      const savedPayments = localStorage.getItem('payments');
      
      if (savedApartments) {
        try {
          const apartments = JSON.parse(savedApartments);
          setApartments(apartments);
        } catch (e) {
          console.error('Error loading apartments from localStorage:', e);
          setApartments([]);
        }
      }
      
      if (savedPayments) {
        try {
          const payments = JSON.parse(savedPayments);
          setPayments(payments);
        } catch (e) {
          console.error('Error loading payments from localStorage:', e);
          setPayments([]);
        }
      }
      
      // Auto-hide error after showing fallback loaded successfully
      if (savedApartments || savedPayments) {
        setTimeout(() => {
          setError(null);
        }, 5000);
      }
    } finally {
      setDataLoading(false);
    }
  };

  // Loading state for authentication and data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Kimlik doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Veriler yükleniyor...</p>
          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg max-w-md mx-auto">
              <p className="font-semibold">Hata:</p>
              <p className="text-sm">{error}</p>
              <button 
                onClick={() => {
                  setError(null);
                  setDataLoading(false);
                  // Try to load from localStorage
                  const savedApartments = localStorage.getItem('apartments');
                  const savedPayments = localStorage.getItem('payments');
                  
                  if (savedApartments) {
                    try {
                      setApartments(JSON.parse(savedApartments));
                    } catch (e) {
                      console.error('Error loading apartments from localStorage:', e);
                    }
                  }
                  
                  if (savedPayments) {
                    try {
                      setPayments(JSON.parse(savedPayments));
                    } catch (e) {
                      console.error('Error loading payments from localStorage:', e);
                    }
                  }
                }} 
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Yerel Verilerle Devam Et
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Sayfayı Yenile
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleAddApartment = async (apartmentData: Omit<LegacyApartment, 'id' | 'createdAt'>) => {
    try {
      const supabaseData = convertFromLegacyApartment(apartmentData);
      const newApartment = await apartmentApi.create(supabaseData);
      const legacyApartment = convertToLegacyApartment(newApartment);
      
      setApartments(prev => [...prev, legacyApartment]);
      
      // Backup to localStorage
      const updatedApartments = [...apartments, legacyApartment];
      localStorage.setItem('apartments', JSON.stringify(updatedApartments));
    } catch (error) {
      console.error('Error adding apartment:', error);
      alert('Daire eklenirken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleUpdateApartment = async (id: string, apartmentData: Omit<LegacyApartment, 'id' | 'createdAt'>) => {
    try {
      const supabaseData = convertFromLegacyApartment(apartmentData);
      const updatedApartment = await apartmentApi.update(parseInt(id), supabaseData);
      const legacyApartment = convertToLegacyApartment(updatedApartment);
      
      setApartments(apartments.map(apt => 
        apt.id === id ? legacyApartment : apt
      ));
      
      // Update related payments if apartment info changed
      const updatedPayments = payments.map(payment => 
        payment.apartmentId === id 
          ? { ...payment, apartmentNumber: apartmentData.number, owner: apartmentData.owner }
          : payment
      );
      setPayments(updatedPayments);
      
      // Backup to localStorage
      const newApartments = apartments.map(apt => apt.id === id ? legacyApartment : apt);
      localStorage.setItem('apartments', JSON.stringify(newApartments));
      localStorage.setItem('payments', JSON.stringify(updatedPayments));
    } catch (error) {
      console.error('Error updating apartment:', error);
      alert('Daire güncellenirken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleDeleteApartment = async (id: string) => {
    if (window.confirm('Bu daireyi silmek istediğinizden emin misiniz? Tüm aidat kayıtları da silinecektir.')) {
      try {
        await apartmentApi.delete(parseInt(id));
        
        // Delete related payments
        const relatedPayments = payments.filter(payment => payment.apartmentId === id);
        await Promise.all(relatedPayments.map(payment => paymentApi.delete(parseInt(payment.id))));
        
        // Update local state
        setApartments(apartments.filter(apt => apt.id !== id));
        setPayments(payments.filter(payment => payment.apartmentId !== id));
        
        // Backup to localStorage
        const updatedApartments = apartments.filter(apt => apt.id !== id);
        const updatedPayments = payments.filter(payment => payment.apartmentId !== id);
        localStorage.setItem('apartments', JSON.stringify(updatedApartments));
        localStorage.setItem('payments', JSON.stringify(updatedPayments));
      } catch (error) {
        console.error('Error deleting apartment:', error);
        alert('Daire silinirken hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  const handleAddPayment = async (paymentData: Omit<LegacyPayment, 'id'>) => {
    // Check if payment already exists for this apartment and month
    const existingPayment = payments.find(p => 
      p.apartmentId === paymentData.apartmentId && p.month === paymentData.month
    );
    
    if (existingPayment) {
      alert('Bu daire için bu ay zaten aidat kaydı bulunmaktadır!');
      return;
    }

    try {
      const supabaseData = convertFromLegacyPayment(paymentData);
      const newPayment = await paymentApi.create(supabaseData);
      const legacyPayment = convertToLegacyPayment(newPayment, apartments);
      
      setPayments(prev => [...prev, legacyPayment]);
      
      // Backup to localStorage
      const updatedPayments = [...payments, legacyPayment];
      localStorage.setItem('payments', JSON.stringify(updatedPayments));
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Ödeme eklenirken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleUpdatePayment = async (id: string, paymentData: Partial<LegacyPayment>) => {
    try {
      const supabaseData: Partial<Payment> = {};
      if (paymentData.amount !== undefined) supabaseData.amount = paymentData.amount;
      if (paymentData.paidAmount !== undefined) supabaseData.paid_amount = paymentData.paidAmount;
      if (paymentData.status !== undefined) supabaseData.status = paymentData.status;
      if (paymentData.paidDate !== undefined) supabaseData.paid_date = paymentData.paidDate;
      if (paymentData.dueDate !== undefined) supabaseData.due_date = paymentData.dueDate;
      
      const updatedPayment = await paymentApi.update(parseInt(id), supabaseData);
      const legacyPayment = convertToLegacyPayment(updatedPayment, apartments);
      
      setPayments(payments.map(payment => 
        payment.id === id ? legacyPayment : payment
      ));
      
      // Backup to localStorage
      const updatedPayments = payments.map(payment => payment.id === id ? legacyPayment : payment);
      localStorage.setItem('payments', JSON.stringify(updatedPayments));
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Ödeme güncellenirken hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (window.confirm('Bu aidat kaydını silmek istediğinizden emin misiniz?')) {
      try {
        await paymentApi.delete(parseInt(id));
        setPayments(payments.filter(payment => payment.id !== id));
        
        // Backup to localStorage
        const updatedPayments = payments.filter(payment => payment.id !== id);
        localStorage.setItem('payments', JSON.stringify(updatedPayments));
      } catch (error) {
        console.error('Error deleting payment:', error);
        alert('Ödeme silinirken hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  const handleGenerateMonthlyPayments = async (month: string, amount: number, dueDate: string) => {
    const existingPayments = payments.filter(p => p.month === month);
    const newPayments: LegacyPayment[] = [];

    for (const apartment of apartments) {
      const hasPayment = existingPayments.some(p => p.apartmentId === apartment.id);
      if (!hasPayment) {
        const newPayment: LegacyPayment = {
          id: `pay_${apartment.id}_${month}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          apartmentId: apartment.id,
          apartmentNumber: apartment.number,
          owner: apartment.owner,
          month,
          amount,
          status: 'pending',
          paidAmount: 0,
          dueDate,
        };
        newPayments.push(newPayment);
      }
    }

    if (newPayments.length > 0) {
      try {
        // Create payments in Supabase
        const supabasePayments = await Promise.all(
          newPayments.map(payment => {
            const supabaseData = convertFromLegacyPayment(payment);
            return paymentApi.create(supabaseData);
          })
        );
        
        // Convert back to legacy format
        const legacyPayments = supabasePayments.map(payment => convertToLegacyPayment(payment, apartments));
        
        setPayments(prev => [...prev, ...legacyPayments]);
        
        // Backup to localStorage
        const updatedPayments = [...payments, ...legacyPayments];
        localStorage.setItem('payments', JSON.stringify(updatedPayments));
        
        alert(`${legacyPayments.length} daire için aidat kaydı oluşturuldu.`);
      } catch (error) {
        console.error('Error generating monthly payments:', error);
        alert('Aylık ödemeler oluşturulurken hata oluştu. Lütfen tekrar deneyin.');
      }
    } else {
      alert('Bu ay için tüm dairelerin aidat kayıtları zaten mevcut.');
    }
  };

  const handleAdvancePayment = async (apartmentId: string, months: string[], totalAmount: number, monthlyAmount: number) => {
    try {
      const apartment = apartments.find(a => a.id === apartmentId);
      if (!apartment) {
        alert('Daire bulunamadı!');
        return;
      }

      const newPayments: LegacyPayment[] = [];
      
      for (const month of months) {
        const existingPayment = payments.find(p => p.apartmentId === apartmentId && p.month === month);
        
        if (existingPayment) {
          console.warn(`Payment already exists for apartment ${apartmentId} and month ${month}`);
          continue;
        }

        const advancePayment: LegacyPayment = {
          id: `adv_${apartmentId}_${month}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          apartmentId,
          apartmentNumber: apartment.number,
          owner: apartment.owner,
          month,
          amount: monthlyAmount,
          status: 'paid',
          paidAmount: monthlyAmount,
          paidDate: new Date().toISOString().split('T')[0],
          dueDate: `${month}-01`,
          isAdvancePayment: true,
          advanceMonths: months,
        };
        newPayments.push(advancePayment);
      }

      if (newPayments.length > 0) {
        // Create payments in Supabase
        const supabasePayments = await Promise.all(
          newPayments.map(payment => {
            const supabaseData = convertFromLegacyPayment(payment);
            return paymentApi.create(supabaseData);
          })
        );
        
        // Convert back to legacy format
        const legacyPayments = supabasePayments.map(payment => convertToLegacyPayment(payment, apartments));
        
        setPayments(prev => [...prev, ...legacyPayments]);
        
        // Backup to localStorage
        const updatedPayments = [...payments, ...legacyPayments];
        localStorage.setItem('payments', JSON.stringify(updatedPayments));
        
        alert(`✅ ${legacyPayments.length} ay peşin ödeme kaydedildi. Toplam: ${totalAmount}₺`);
      }

    } catch (error) {
      console.error('Advance payment error:', error);
      alert('❌ Peşin ödeme kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleGenerateWhatsAppMessage = (_apartmentId: string, _payment: LegacyPayment) => {
    setActiveTab('whatsapp');
    // This will be handled by the WhatsApp component
  };

  const menuItems = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: Home },
    { id: 'apartments', label: 'Daire Yönetimi', icon: Building },
    { id: 'payments', label: 'Aidat Yönetimi', icon: DollarSign },
    { id: 'advance', label: 'Peşin Ödemeler', icon: BarChart },
    { id: 'reports', label: 'Raporlar', icon: BarChart },
    { id: 'whatsapp', label: 'WhatsApp Mesajları', icon: MessageCircle },
  ];

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-md p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">Apartman Yönetim Sistemi</h2>
            <p className="text-blue-100">Hoş geldiniz! Sistem başarıyla yüklendi.</p>
            <div className="mt-4 text-sm">
              <span className="bg-blue-500 bg-opacity-50 px-2 py-1 rounded">
                {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })} Dönemi
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Toplam Daireler</p>
                  <p className="text-3xl font-bold text-gray-900">{apartments.length}</p>
                </div>
                <Building className="h-12 w-12 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Bu Ay Ödemeler</p>
                  <p className="text-3xl font-bold text-green-600">{payments.filter(p => p.month === currentMonth && p.status === 'paid').length}</p>
                </div>
                <DollarSign className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Bekleyen Ödemeler</p>
                  <p className="text-3xl font-bold text-red-600">{payments.filter(p => p.month === currentMonth && p.status !== 'paid').length}</p>
                </div>
                <MessageCircle className="h-12 w-12 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Hızlı İşlemler</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button 
                onClick={() => setActiveTab('apartments')}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg transition-colors"
              >
                <Building className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm">Daire Ekle</span>
              </button>
              <button 
                onClick={() => setActiveTab('payments')}
                className="bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-lg transition-colors"
              >
                <DollarSign className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm">Ödeme Ekle</span>
              </button>
              <button 
                onClick={() => setActiveTab('reports')}
                className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg transition-colors"
              >
                <BarChart className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm">Raporlar</span>
              </button>
              <button 
                onClick={() => setActiveTab('whatsapp')}
                className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 p-4 rounded-lg transition-colors"
              >
                <MessageCircle className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm">Mesajlar</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'apartments':
        return (
          <ApartmentManagement
            apartments={apartments}
            onAddApartment={handleAddApartment}
            onUpdateApartment={handleUpdateApartment}
            onDeleteApartment={handleDeleteApartment}
          />
        );
      case 'payments':
        return (
          <PaymentManagement
            payments={payments}
            apartments={apartments}
            onAddPayment={handleAddPayment}
            onUpdatePayment={handleUpdatePayment}
            onDeletePayment={handleDeletePayment}
            onGenerateMonthlyPayments={handleGenerateMonthlyPayments}
            onGenerateWhatsAppMessage={handleGenerateWhatsAppMessage}
          />
        );
      case 'advance':
        return (
          <AdvancePayments
            apartments={apartments}
            payments={payments}
            onAdvancePayment={handleAdvancePayment}
          />
        );
      case 'reports':
        return <Reports />;
      case 'whatsapp':
        return <WhatsAppMessages apartments={apartments} payments={payments} />;
      default:
        return (
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold">Apartman Yönetimi</h2>
            <p>Lütfen sol menüden bir seçenek seçin.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with logout */}
      <Header />
      
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-20 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white p-2 rounded-lg shadow-md"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 pt-16`}>
        <div className="p-6">
          <div className="flex items-center mb-8">
            <Building className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-800">Apartman Yönetimi</h1>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 pt-16">
        <div className="p-6">
          {renderContent()}
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// Main Core component that provides authentication context
function Core() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default Core;

import React, { useState, useEffect } from 'react';
import { BarChart, Calendar, Download, TrendingUp, TrendingDown, FileText, AlertCircle, Loader2, Search, Filter, SortAsc, SortDesc } from 'lucide-react';

// Local interfaces
interface Apartment {
  id: string;
  number: string;
  floor: number;
  owner: string;
  phone: string;
  email: string;
  createdAt: string;
}

interface Payment {
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

// Enriched Payment type for the UI
interface EnrichedPayment extends Payment {
  phone?: string;
  email?: string;
}

const Reports: React.FC = () => {
  const [filterType, setFilterType] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Yeni filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'partial' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'apartmentNumber' | 'owner' | 'amount' | 'dueDate' | 'paidDate'>('apartmentNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Verileri localStorage'dan yükle
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // localStorage'dan veri oku
        const savedApartments = localStorage.getItem('apartments');
        const savedPayments = localStorage.getItem('payments');
        
        const apartmentsData: Apartment[] = savedApartments ? JSON.parse(savedApartments) : [];
        const paymentsData: Payment[] = savedPayments ? JSON.parse(savedPayments) : [];
        
        setApartments(apartmentsData);
        setPayments(paymentsData);
      } catch (err) {
        setError('Veriler yüklenirken bir hata oluştu: ' + (err as Error).message);
        console.error('Data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Loading durumu
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Raporlar yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error durumu
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Veri Yükleme Hatası</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  const getFilteredPayments = () => {
    let filtered = payments;

    // Dönem filtresi (ay/yıl)
    if (filterType === 'monthly') {
      filtered = filtered.filter(p => p.month === selectedPeriod);
    } else {
      const year = selectedPeriod;
      filtered = filtered.filter(p => p.month.startsWith(year));
    }

    return filtered;
  };

  const getFilteredAndSortedPayments = () => {
    let filtered = getFilteredPayments();
    
    // Daire bilgilerini ödemelerle birleştir
    let enriched: EnrichedPayment[] = filtered.map(payment => {
      const apartment = apartments.find(a => a.id === payment.apartmentId);
      return {
        ...payment,
        phone: apartment?.phone || '',
        email: apartment?.email || ''
      };
    });

    // Arama filtresi (daire numarası veya sahibi)
    if (searchTerm) {
      enriched = enriched.filter(p => 
        p.apartmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.owner.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Durum filtresi
    if (statusFilter !== 'all') {
      if (statusFilter === 'overdue') {
        enriched = enriched.filter(p => {
          const isOverdue = new Date(p.dueDate) < new Date() && p.status !== 'paid';
          return isOverdue;
        });
      } else {
        enriched = enriched.filter(p => p.status === statusFilter);
      }
    }

    // Sıralama
    enriched.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'apartmentNumber':
          aValue = parseInt(a.apartmentNumber) || 0;
          bValue = parseInt(b.apartmentNumber) || 0;
          break;
        case 'owner':
          aValue = a.owner.toLowerCase();
          bValue = b.owner.toLowerCase();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
          break;
        case 'paidDate':
          aValue = a.paidDate ? new Date(a.paidDate) : new Date('1900-01-01');
          bValue = b.paidDate ? new Date(b.paidDate) : new Date('1900-01-01');
          break;
        default:
          aValue = a.apartmentNumber;
          bValue = b.apartmentNumber;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return enriched;
  };

  const filteredPayments = getFilteredPayments();
  const enrichedPayments = getFilteredAndSortedPayments();

  const totalAmount = enrichedPayments.reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = enrichedPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.paidAmount, 0);
  const partialAmount = enrichedPayments.filter(p => p.status === 'partial').reduce((sum, p) => sum + p.paidAmount, 0);
  const totalCollected = paidAmount + partialAmount;
  const pendingAmount = totalAmount - totalCollected;
  const collectionRate = totalAmount > 0 ? (totalCollected / totalAmount) * 100 : 0;

  const exportReport = () => {
    if (enrichedPayments.length === 0) {
      alert('Dışa aktarılacak veri bulunamadı!');
      return;
    }

    const data = enrichedPayments.map(p => ({
      'Daire': p.apartmentNumber,
      'Sahibi': p.owner,
      'Ay': p.month,
      'Tutar': p.amount,
      'Ödenen': p.paidAmount,
      'Kalan': p.amount - p.paidAmount,
      'Durum': p.status === 'paid' ? 'Ödendi' : p.status === 'partial' ? 'Kısmi' : 'Bekliyor',
      'Son Ödeme Tarihi': p.dueDate,
      'Ödeme Tarihi': p.paidDate || '-',
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aidat-raporu-${selectedPeriod}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Raporlar ve Analizler</h2>
          <button
            onClick={exportReport}
            disabled={enrichedPayments.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Excel İndir
          </button>
        </div>

        {/* Filtreleme Paneli */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Filtreleme ve Sıralama</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Dönem Seçici */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Dönem Türü</label>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as 'monthly' | 'yearly');
                  if (e.target.value === 'yearly') {
                    setSelectedPeriod(new Date().getFullYear().toString());
                  } else {
                    setSelectedPeriod(new Date().toISOString().slice(0, 7));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">Aylık</option>
                <option value="yearly">Yıllık</option>
              </select>
            </div>

            {/* Dönem Seçimi */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {filterType === 'monthly' ? 'Ay' : 'Yıl'}
              </label>
              {filterType === 'monthly' ? (
                <input
                  type="month"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <input
                  type="number"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Yıl"
                  min="2020"
                  max="2030"
                />
              )}
            </div>

            {/* Arama */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Daire/Sahibi Ara</label>
              <div className="relative">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Daire no veya isim..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Durum Filtresi */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Ödeme Durumu</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tümü</option>
                <option value="paid">Ödenenler</option>
                <option value="partial">Kısmi Ödemeler</option>
                <option value="pending">Bekleyenler</option>
                <option value="overdue">Vadesi Geçenler</option>
              </select>
            </div>

            {/* Sıralama Kriteri */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sıralama</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="apartmentNumber">Daire No</option>
                <option value="owner">Sahibi</option>
                <option value="amount">Tutar</option>
                <option value="dueDate">Son Ödeme Tarihi</option>
                <option value="paidDate">Ödeme Tarihi</option>
              </select>
            </div>

            {/* Sıralama Yönü */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Yön</label>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2"
              >
                {sortOrder === 'asc' ? (
                  <>
                    <SortAsc className="h-4 w-4" />
                    Artan
                  </>
                ) : (
                  <>
                    <SortDesc className="h-4 w-4" />
                    Azalan
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Filtre Özeti */}
          {(searchTerm || statusFilter !== 'all') && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <span className="font-medium">Aktif Filtreler:</span>
                  {searchTerm && <span className="bg-blue-200 px-2 py-1 rounded">Arama: "{searchTerm}"</span>}
                  {statusFilter !== 'all' && (
                    <span className="bg-blue-200 px-2 py-1 rounded">
                      Durum: {statusFilter === 'paid' ? 'Ödenenler' : 
                              statusFilter === 'partial' ? 'Kısmi' : 
                              statusFilter === 'pending' ? 'Bekleyenler' : 'Vadesi Geçenler'}
                    </span>
                  )}
                  <span className="bg-blue-200 px-2 py-1 rounded">{enrichedPayments.length} kayıt</span>
                </div>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Filtreleri Temizle
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Toplam Aidat</p>
              <p className="text-2xl font-bold text-gray-900">{totalAmount.toLocaleString('tr-TR')} ₺</p>
              <p className="text-xs text-gray-400 mt-1">{filteredPayments.length} kayıt</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <BarChart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Tahsil Edilen</p>
              <p className="text-2xl font-bold text-green-600">{totalCollected.toLocaleString('tr-TR')} ₺</p>
              <p className="text-xs text-gray-400 mt-1">%{Math.round(collectionRate)} tahsilat</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Bekleyen</p>
              <p className="text-2xl font-bold text-red-600">{pendingAmount.toLocaleString('tr-TR')} ₺</p>
              <p className="text-xs text-gray-400 mt-1">{enrichedPayments.filter(p => p.status !== 'paid').length} borçlu</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Tahsilat Oranı</p>
              <p className="text-2xl font-bold text-blue-600">{Math.round(collectionRate)}%</p>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${collectionRate}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <BarChart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* No Data Message */}
      {enrichedPayments.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Veri Bulunamadı</h3>
          <p className="text-gray-500 mb-4">
            {filterType === 'monthly' 
              ? `${new Date(selectedPeriod + '-01').toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })} ayına ait aidat kaydı bulunamadı.`
              : `${selectedPeriod} yılına ait aidat kaydı bulunamadı.`
            }
          </p>
          <p className="text-sm text-gray-400">
            Filtreleri değiştirin veya önce daireler ekleyip aidat kayıtları oluşturun.
          </p>
        </div>
      )}

      {/* Detailed Payment List */}
      {enrichedPayments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Detaylı Ödeme Listesi ({enrichedPayments.length} kayıt)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Daire No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Daire Sahibi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dönem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aidat Tutarı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ödeme Durumu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Son Ödeme Tarihi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrichedPayments.map((payment) => {
                  const isOverdue = new Date(payment.dueDate) < new Date() && payment.status !== 'paid';
                  const remainingDebt = payment.amount - payment.paidAmount;
                  const paymentPercentage = (payment.paidAmount / payment.amount) * 100;
                  
                  return (
                    <tr key={payment.id} className={`hover:bg-gray-50 ${
                      isOverdue ? 'bg-red-50' : payment.status === 'paid' ? 'bg-green-50' : ''
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        <div className="flex items-center">
                          <span className="text-lg">{payment.apartmentNumber}</span>
                          {isOverdue && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Vadesi Geçti
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">{payment.owner}</div>
                        {payment.phone && (
                          <div className="text-xs text-gray-500">{payment.phone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">
                          {new Date(payment.month + '-01').toLocaleDateString('tr-TR', { 
                            year: 'numeric', 
                            month: 'long' 
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="font-semibold text-blue-600">
                          {payment.amount.toLocaleString('tr-TR')} ₺
                        </div>
                        {payment.paidAmount > 0 && (
                          <div className="text-xs text-green-600">
                            Ödenen: {payment.paidAmount.toLocaleString('tr-TR')} ₺
                          </div>
                        )}
                        {remainingDebt > 0 && (
                          <div className="text-xs text-red-600">
                            Kalan: {remainingDebt.toLocaleString('tr-TR')} ₺
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            payment.status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : payment.status === 'partial'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {payment.status === 'paid' 
                              ? 'Tamamen Ödendi' 
                              : payment.status === 'partial'
                              ? 'Kısmi Ödeme'
                              : 'Ödeme Bekliyor'
                            }
                          </span>
                          {payment.status !== 'pending' && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  payment.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'
                                }`}
                                style={{ width: `${paymentPercentage}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className={`font-medium ${
                          isOverdue ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {new Date(payment.dueDate).toLocaleDateString('tr-TR')}
                        </div>
                        {isOverdue && (
                          <div className="text-xs text-red-600 font-medium">
                            {Math.ceil((new Date().getTime() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24))} gün gecikme
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;

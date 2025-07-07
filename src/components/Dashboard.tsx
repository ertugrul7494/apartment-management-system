import React from 'react';
import { Building, Users, TrendingUp, AlertCircle, Calendar, DollarSign, Plus, FileText, MessageCircle, CreditCard } from 'lucide-react';

interface DashboardProps {
  apartments: any[];
  payments: any[];
  currentMonth: string;
  onQuickAction: (action: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ apartments, payments, currentMonth, onQuickAction }) => {
  const totalApartments = apartments.length;
  const currentMonthPayments = payments.filter(p => p.month === currentMonth);
  const paidCount = currentMonthPayments.filter(p => p.status === 'paid').length;
  const pendingCount = currentMonthPayments.filter(p => p.status === 'pending' || p.status === 'partial').length;
  const totalAmount = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
  const paidAmount = currentMonthPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.paidAmount, 0);
  const partialAmount = currentMonthPayments.filter(p => p.status === 'partial').reduce((sum, p) => sum + p.paidAmount, 0);
  const totalCollected = paidAmount + partialAmount;
  const pendingAmount = totalAmount - totalCollected;

  // Recent activities
  const recentPayments = payments
    .filter(p => p.paidDate)
    .sort((a, b) => new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime())
    .slice(0, 5);

  const upcomingDues = currentMonthPayments
    .filter(p => p.status !== 'paid')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  // Advance payments count
  const advancePaymentsCount = payments.filter(p => p.isAdvancePayment).length;

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* Ana Header - Mobil için optimize edilmiş */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-4 sm:p-6 text-white">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">📱 Apartman Yönetimi</h2>
        <p className="text-blue-100 text-sm sm:text-base font-medium">Hoş geldiniz! Mobil apartman takip sisteminiz hazır.</p>
        <div className="mt-3 text-xs sm:text-sm">
          <span className="bg-blue-500 bg-opacity-60 px-3 py-2 rounded-full font-bold">
            📅 {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })} Dönemi
          </span>
        </div>
      </div>

      {/* İstatistik Kartları - Mobil için 2x2 grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="card hover:shadow-xl transition-all duration-200 active:scale-95">
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-100 rounded-full p-2 sm:p-3 mb-2">
              <Building className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-gray-600">Toplam Daire</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{totalApartments}</p>
            <p className="text-xs text-gray-500 font-medium">Kayıtlı daire</p>
          </div>
        </div>

        <div className="card hover:shadow-xl transition-all duration-200 active:scale-95">
          <div className="flex flex-col items-center text-center">
            <div className="bg-green-100 rounded-full p-2 sm:p-3 mb-2">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-green-600">✅ Ödenen</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{paidCount}</p>
            <p className="text-xs text-gray-500 font-medium">Bu ay ödenen</p>
          </div>
        </div>

        <div className="card hover:shadow-xl transition-all duration-200 active:scale-95">
          <div className="flex flex-col items-center text-center">
            <div className="bg-red-100 rounded-full p-2 sm:p-3 mb-2">
              <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-red-600">⚠️ Borçlu</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">{pendingCount}</p>
            <p className="text-xs text-gray-500 font-medium">Bekleyen</p>
          </div>
        </div>

        <div className="card hover:shadow-xl transition-all duration-200 active:scale-95">
          <div className="flex flex-col items-center text-center">
            <div className="bg-green-100 rounded-full p-2 sm:p-3 mb-2">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-green-600">💰 Tahsilat</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{totalCollected.toLocaleString('tr-TR')} ₺</p>
            <p className="text-xs text-gray-500 font-medium">Bu ay toplam</p>
          </div>
        </div>
      </div>

      {/* Alt Bölüm - Mobilde tek sütun */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Bu Ay Özeti */}
        <div className="card">
          <h3 className="heading-3 flex items-center mb-4">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            📊 Bu Ay Özeti
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-body">Toplam Aidat:</span>
              <span className="font-bold text-lg">{totalAmount.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-body text-green-700">✅ Tahsil Edilen:</span>
              <span className="font-bold text-lg text-green-600">{totalCollected.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-body text-red-700">⏳ Bekleyen:</span>
              <span className="font-bold text-lg text-red-600">{pendingAmount.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="pt-3 border-t-2 border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <span className="text-body">📈 Tahsilat Oranı:</span>
                <span className="font-bold text-xl text-blue-600">
                  {totalAmount > 0 ? Math.round((totalCollected / totalAmount) * 100) : 0}%
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${totalAmount > 0 ? (totalCollected / totalAmount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Hızlı İşlemler */}
        <div className="card">
          <h3 className="heading-3 flex items-center mb-4">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            ⚡ Hızlı İşlemler
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => onQuickAction('add-apartment')}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5" />
              🏠 Yeni Daire Ekle
            </button>
            <button 
              onClick={() => onQuickAction('add-payment')}
              className="btn-success w-full flex items-center justify-center gap-2"
            >
              <DollarSign className="h-5 w-5" />
              💳 Aidat Girişi
            </button>
            <button 
              onClick={() => onQuickAction('advance-payment')}
              className="btn-warning w-full flex items-center justify-center gap-2"
            >
              <CreditCard className="h-5 w-5" />
              🏦 Peşin Ödeme
            </button>
            <button 
              onClick={() => onQuickAction('debtors')}
              className="btn-danger w-full flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              📞 Borçlu Listesi
            </button>
            <button 
              onClick={() => onQuickAction('reports')}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <FileText className="h-5 w-5" />
              📊 Raporlar
            </button>
          </div>
        </div>

        {/* Yaklaşan Vadeler */}
        <div className="card">
          <h3 className="heading-3 flex items-center mb-4">
            <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
            ⏰ Yaklaşan Vadeler
          </h3>
          <div className="space-y-3">
            {upcomingDues.length > 0 ? (
              upcomingDues.map((payment) => (
                <div key={payment.id} className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-gray-800">🏠 Daire {payment.apartmentNumber}</span>
                      <div className="text-small text-gray-600">{payment.owner}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-red-600">{payment.amount.toLocaleString('tr-TR')} ₺</div>
                      <div className="text-xs text-gray-500 font-medium">📅 {new Date(payment.dueDate).toLocaleDateString('tr-TR')}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-body">✅ Yaklaşan vade yok</p>
                <p className="text-small">Tüm ödemeler güncel!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Peşin Ödeme İstatistikleri */}
      {advancePaymentsCount > 0 && (
        <div className="card">
          <h3 className="heading-2 flex items-center mb-4">
            <CreditCard className="h-6 w-6 mr-2 text-purple-600" />
            🏦 Peşin Ödeme İstatistikleri
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-purple-100 p-4 rounded-xl border-2 border-purple-200">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">{advancePaymentsCount}</div>
              <div className="text-small text-purple-700 font-medium">Toplam Peşin Ödeme</div>
            </div>
            <div className="bg-green-100 p-4 rounded-xl border-2 border-green-200">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {payments.filter(p => p.isAdvancePayment).reduce((sum, p) => sum + p.paidAmount, 0).toLocaleString('tr-TR')} ₺
              </div>
              <div className="text-small text-green-700 font-medium">Peşin Ödeme Tutarı</div>
            </div>
            <div className="bg-blue-100 p-4 rounded-xl border-2 border-blue-200">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {Array.from(new Set(payments.filter(p => p.isAdvancePayment).map(p => p.apartmentId))).length}
              </div>
              <div className="text-small text-blue-700 font-medium">Peşin Ödeyen Daire</div>
            </div>
          </div>
        </div>
      )}

      {/* Son Ödemeler Tablosu */}
      {recentPayments.length > 0 && (
        <div className="card">
          <h3 className="heading-2 flex items-center mb-4">
            <DollarSign className="h-6 w-6 mr-2 text-green-600" />
            💰 Son Ödemeler
          </h3>
          <div className="overflow-x-auto">
            {/* Mobil view - card layout */}
            <div className="space-y-3 sm:hidden">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-gray-800">🏠 Daire {payment.apartmentNumber}</div>
                      <div className="text-small text-gray-600">{payment.owner}</div>
                    </div>
                    <div className={payment.isAdvancePayment ? 'badge-warning' : 'badge-success'}>
                      {payment.isAdvancePayment ? '🏦 Peşin' : '💳 Normal'}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-lg text-green-600">{payment.paidAmount.toLocaleString('tr-TR')} ₺</div>
                    <div className="text-small text-gray-500">📅 {new Date(payment.paidDate!).toLocaleDateString('tr-TR')}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Desktop view - table */}
            <table className="w-full hidden sm:table">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">🏠 Daire</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">👤 Sahibi</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">💰 Tutar</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">📅 Tarih</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">🔖 Tip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-body font-bold text-gray-900">{payment.apartmentNumber}</td>
                    <td className="px-4 py-3 text-body text-gray-600">{payment.owner}</td>
                    <td className="px-4 py-3 text-body text-green-600 font-bold">{payment.paidAmount.toLocaleString('tr-TR')} ₺</td>
                    <td className="px-4 py-3 text-small text-gray-500">{new Date(payment.paidDate!).toLocaleDateString('tr-TR')}</td>
                    <td className="px-4 py-3">
                      {payment.isAdvancePayment ? (
                        <span className="badge-warning">🏦 Peşin</span>
                      ) : (
                        <span className="badge-success">💳 Normal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
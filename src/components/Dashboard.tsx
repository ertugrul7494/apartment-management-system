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
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-md p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Apartman Yönetim Sistemi</h2>
        <p className="text-blue-100">Hoş geldiniz! Apartman aidat takip sisteminiz hazır.</p>
        <div className="mt-4 text-sm">
          <span className="bg-blue-500 bg-opacity-50 px-2 py-1 rounded">
            {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })} Dönemi
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Toplam Daire</p>
              <p className="text-2xl font-bold text-gray-900">{totalApartments}</p>
              <p className="text-xs text-gray-400 mt-1">Kayıtlı daire sayısı</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Ödenen Daire</p>
              <p className="text-2xl font-bold text-green-600">{paidCount}</p>
              <p className="text-xs text-gray-400 mt-1">Bu ay ödeme yapan</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Borçlu Daire</p>
              <p className="text-2xl font-bold text-red-600">{pendingCount}</p>
              <p className="text-xs text-gray-400 mt-1">Ödeme bekleyen</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Toplam Tahsilat</p>
              <p className="text-2xl font-bold text-green-600">{totalCollected.toLocaleString('tr-TR')} ₺</p>
              <p className="text-xs text-gray-400 mt-1">Bu ay toplanan</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Bu Ay Özeti
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Toplam Aidat:</span>
              <span className="font-semibold">{totalAmount.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tahsil Edilen:</span>
              <span className="font-semibold text-green-600">{totalCollected.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Bekleyen:</span>
              <span className="font-semibold text-red-600">{pendingAmount.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tahsilat Oranı:</span>
                <span className="font-semibold text-blue-600">
                  {totalAmount > 0 ? Math.round((totalCollected / totalAmount) * 100) : 0}%
                </span>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalAmount > 0 ? (totalCollected / totalAmount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Hızlı İşlemler
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => onQuickAction('add-apartment')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Yeni Daire Ekle
            </button>
            <button 
              onClick={() => onQuickAction('add-payment')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Aidat Girişi
            </button>
            <button 
              onClick={() => onQuickAction('advance-payment')}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Peşin Ödeme
            </button>
            <button 
              onClick={() => onQuickAction('debtors')}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Borçlu Listesi
            </button>
            <button 
              onClick={() => onQuickAction('reports')}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Raporlar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
            Yaklaşan Vadeler
          </h3>
          <div className="space-y-3">
            {upcomingDues.length > 0 ? (
              upcomingDues.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-medium">{payment.apartmentNumber}</span>
                    <span className="text-gray-500 ml-2">{payment.owner}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-red-600">{payment.amount.toLocaleString('tr-TR')} ₺</div>
                    <div className="text-xs text-gray-500">{new Date(payment.dueDate).toLocaleDateString('tr-TR')}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Yaklaşan vade yok</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Row */}
      {advancePaymentsCount > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
            Peşin Ödeme İstatistikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{advancePaymentsCount}</div>
              <div className="text-sm text-purple-700">Toplam Peşin Ödeme</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {payments.filter(p => p.isAdvancePayment).reduce((sum, p) => sum + p.paidAmount, 0).toLocaleString('tr-TR')} ₺
              </div>
              <div className="text-sm text-green-700">Peşin Ödeme Tutarı</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Array.from(new Set(payments.filter(p => p.isAdvancePayment).map(p => p.apartmentId))).length}
              </div>
              <div className="text-sm text-blue-700">Peşin Ödeyen Daire</div>
            </div>
          </div>
        </div>
      )}

      {recentPayments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
            Son Ödemeler
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Daire</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sahibi</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tutar</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{payment.apartmentNumber}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{payment.owner}</td>
                    <td className="px-4 py-2 text-sm text-green-600 font-medium">{payment.paidAmount.toLocaleString('tr-TR')} ₺</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{new Date(payment.paidDate!).toLocaleDateString('tr-TR')}</td>
                    <td className="px-4 py-2 text-sm">
                      {payment.isAdvancePayment ? (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">Peşin</span>
                      ) : (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Normal</span>
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
import React, { useState } from 'react';
import { Calendar, DollarSign, CreditCard, CheckCircle, AlertCircle, User, Home, Calculator, Info } from 'lucide-react';

interface AdvancePaymentsProps {
  apartments: any[];
  payments: any[];
  onAdvancePayment: (apartmentId: string, months: string[], totalAmount: number, monthlyAmount: number) => void;
}

const AdvancePayments: React.FC<AdvancePaymentsProps> = ({
  apartments,
  payments,
  onAdvancePayment,
}) => {
  const [selectedApartment, setSelectedApartment] = useState('');
  const [startMonth, setStartMonth] = useState(new Date().toISOString().slice(0, 7));
  const [monthCount, setMonthCount] = useState(1);
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [totalPaid, setTotalPaid] = useState('');

  const generateMonthList = (start: string, count: number) => {
    const months = [];
    const startDate = new Date(start + '-01');
    
    for (let i = 0; i < count; i++) {
      const currentDate = new Date(startDate);
      currentDate.setMonth(startDate.getMonth() + i);
      months.push(currentDate.toISOString().slice(0, 7));
    }
    
    return months;
  };

  const getExistingPayments = (apartmentId: string, months: string[]) => {
    return months.map(month => {
      const existing = payments.find(p => p.apartmentId === apartmentId && p.month === month);
      return {
        month,
        exists: !!existing,
        status: existing?.status || 'none',
        amount: existing?.amount || 0,
        paidAmount: existing?.paidAmount || 0,
        isAdvancePayment: existing?.isAdvancePayment || false,
      };
    });
  };

  const calculateAmounts = () => {
    const monthly = parseFloat(monthlyAmount || '0');
    const total = parseFloat(totalPaid || '0');
    const expectedTotal = monthly * monthCount;
    const tolerance = 0.01;
    
    return {
      monthlyAmount: monthly,
      totalPaid: total,
      expectedTotal,
      isValid: total > 0 && monthly > 0 && Math.abs(total - expectedTotal) <= tolerance,
      difference: total - expectedTotal,
      hasValues: monthly > 0 || total > 0,
    };
  };

  const handleMonthlyAmountChange = (value: string) => {
    setMonthlyAmount(value);
    if (value && monthCount && parseFloat(value) > 0) {
      const calculated = parseFloat(value) * monthCount;
      setTotalPaid(calculated.toFixed(2));
    } else if (!value) {
      setTotalPaid('');
    }
  };

  const handleTotalPaidChange = (value: string) => {
    setTotalPaid(value);
    if (value && monthCount > 0 && parseFloat(value) > 0) {
      const calculated = parseFloat(value) / monthCount;
      setMonthlyAmount(calculated.toFixed(2));
    } else if (!value) {
      setMonthlyAmount('');
    }
  };

  const handleMonthCountChange = (value: number) => {
    const newCount = Math.max(1, Math.min(12, value));
    setMonthCount(newCount);
    
    if (monthlyAmount && parseFloat(monthlyAmount) > 0) {
      const calculated = parseFloat(monthlyAmount) * newCount;
      setTotalPaid(calculated.toFixed(2));
    } else if (totalPaid && parseFloat(totalPaid) > 0) {
      const calculated = parseFloat(totalPaid) / newCount;
      setMonthlyAmount(calculated.toFixed(2));
    }
  };

  const resetForm = () => {
    setSelectedApartment('');
    setMonthlyAmount('');
    setTotalPaid('');
    setMonthCount(1);
    setStartMonth(new Date().toISOString().slice(0, 7));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedApartment) {
      alert('❌ Lütfen daire seçin!');
      return;
    }

    if (!monthlyAmount || !totalPaid || monthCount < 1) {
      alert('❌ Lütfen tüm alanları doldurun!');
      return;
    }

    const amounts = calculateAmounts();
    
    if (!amounts.isValid) {
      alert(`❌ Tutar hesaplama hatası!\n\n📊 Detaylar:\n• Aylık Tutar: ${amounts.monthlyAmount.toLocaleString('tr-TR')} ₺\n• Ay Sayısı: ${monthCount}\n• Beklenen Toplam: ${amounts.expectedTotal.toLocaleString('tr-TR')} ₺\n• Girilen Toplam: ${amounts.totalPaid.toLocaleString('tr-TR')} ₺\n• Fark: ${amounts.difference.toLocaleString('tr-TR')} ₺\n\n💡 Lütfen tutarları kontrol edin.`);
      return;
    }

    const months = generateMonthList(startMonth, monthCount);
    const apartment = apartments.find(a => a.id === selectedApartment);
    const existingPayments = getExistingPayments(selectedApartment, months);
    const alreadyPaid = existingPayments.filter(p => p.exists && p.status === 'paid').length;
    const willProcess = existingPayments.filter(p => !p.exists || p.status !== 'paid').length;
    
    if (alreadyPaid === months.length) {
      alert('⚠️ Seçilen tüm aylar için zaten ödeme yapılmış!');
      return;
    }

    const confirmMessage = `🏠 ${apartment?.number} numaralı daire için peşin ödeme kaydedilsin mi?\n\n` +
      `📅 Aylar: ${months.map(m => new Date(m + '-01').toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })).join(', ')}\n` +
      `💰 Aylık Tutar: ${amounts.monthlyAmount.toLocaleString('tr-TR')} ₺\n` +
      `💳 Toplam Ödenen: ${amounts.totalPaid.toLocaleString('tr-TR')} ₺\n\n` +
      `📊 İşlem Detayı:\n` +
      `• İşlenecek: ${willProcess} ay\n` +
      (alreadyPaid > 0 ? `• Zaten ödenmiş: ${alreadyPaid} ay\n` : '') +
      `\n✅ Onaylıyor musunuz?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        onAdvancePayment(selectedApartment, months, amounts.totalPaid, amounts.monthlyAmount);
        resetForm();
      } catch (error) {
        console.error('Advance payment error:', error);
        alert('❌ Peşin ödeme kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    }
  };

  const selectedApartmentData = apartments.find(a => a.id === selectedApartment);
  const previewMonths = selectedApartment ? generateMonthList(startMonth, monthCount) : [];
  const existingPayments = selectedApartment ? getExistingPayments(selectedApartment, previewMonths) : [];
  const amounts = calculateAmounts();

  // Get advance payment history
  const advancePaymentHistory = payments.filter(p => p.isAdvancePayment);
  const groupedHistory = advancePaymentHistory.reduce((acc, payment) => {
    const key = `${payment.apartmentId}-${payment.paidDate}`;
    if (!acc[key]) {
      acc[key] = {
        apartmentId: payment.apartmentId,
        apartmentNumber: payment.apartmentNumber,
        owner: payment.owner,
        paidDate: payment.paidDate,
        months: [],
        totalAmount: 0,
      };
    }
    acc[key].months.push(payment.month);
    acc[key].totalAmount += payment.paidAmount;
    return acc;
  }, {} as any);

  const historyList = Object.values(groupedHistory).sort((a: any, b: any) => 
    new Date(b.paidDate).getTime() - new Date(a.paidDate).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Peşin Ödemeler</h2>
        <div className="text-sm text-gray-600 flex items-center">
          <Info className="h-4 w-4 mr-1" />
          Gelecek aylar için peşin ödeme alın
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peşin Ödeme Formu */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-green-600" />
            Peşin Ödeme Kaydet
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daire Seç *
              </label>
              <select
                value={selectedApartment}
                onChange={(e) => setSelectedApartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Daire seçin</option>
                {apartments.map(apartment => (
                  <option key={apartment.id} value={apartment.id}>
                    {apartment.number} - {apartment.owner}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlangıç Ayı *
                </label>
                <input
                  type="month"
                  value={startMonth}
                  onChange={(e) => setStartMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ay Sayısı * (1-12)
                </label>
                <input
                  type="number"
                  value={monthCount}
                  onChange={(e) => handleMonthCountChange(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="1"
                  max="12"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aylık Aidat Tutarı (₺) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={monthlyAmount}
                  onChange={(e) => handleMonthlyAmountChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Örn: 550"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Toplam Ödenen (₺) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={totalPaid}
                  onChange={(e) => handleTotalPaidChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Örn: 1100"
                  required
                />
              </div>
            </div>

            {/* Calculation Summary */}
            {amounts.hasValues && (
              <div className={`p-4 rounded-lg border-2 ${amounts.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center mb-2">
                  <Calculator className={`h-4 w-4 mr-2 ${amounts.isValid ? 'text-green-600' : 'text-red-600'}`} />
                  <span className={`text-sm font-medium ${amounts.isValid ? 'text-green-800' : 'text-red-800'}`}>
                    Hesaplama Kontrolü
                  </span>
                </div>
                <div className={`text-sm space-y-1 ${amounts.isValid ? 'text-green-700' : 'text-red-700'}`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div>Aylık Tutar: <span className="font-medium">{amounts.monthlyAmount.toLocaleString('tr-TR')} ₺</span></div>
                      <div>Ay Sayısı: <span className="font-medium">{monthCount} ay</span></div>
                    </div>
                    <div>
                      <div>Beklenen: <span className="font-medium">{amounts.expectedTotal.toLocaleString('tr-TR')} ₺</span></div>
                      <div>Girilen: <span className="font-medium">{amounts.totalPaid.toLocaleString('tr-TR')} ₺</span></div>
                    </div>
                  </div>
                  {amounts.isValid ? (
                    <div className="font-semibold text-green-800 flex items-center mt-2">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      ✓ Hesaplama doğru - İşleme hazır
                    </div>
                  ) : (
                    <div className="font-semibold text-red-800 flex items-center mt-2">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      ❌ Fark: {Math.abs(amounts.difference).toLocaleString('tr-TR')} ₺
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!amounts.isValid || !selectedApartment}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Peşin Ödeme Kaydet
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Temizle
              </button>
            </div>
          </form>
        </div>

        {/* Önizleme */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Ödeme Önizlemesi
          </h3>
          
          {selectedApartmentData ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <Home className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-800">
                    {selectedApartmentData.number} - {selectedApartmentData.owner}
                  </span>
                </div>
                <div className="text-sm text-blue-700">
                  <div>📞 {selectedApartmentData.phone}</div>
                  {selectedApartmentData.email && <div>📧 {selectedApartmentData.email}</div>}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Ödenecek Aylar ({previewMonths.length}):
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {existingPayments.map((payment, index) => (
                    <div key={payment.month} className={`flex items-center justify-between p-2 rounded text-sm ${
                      payment.exists && payment.status === 'paid' 
                        ? 'bg-green-50 border border-green-200' 
                        : payment.exists 
                        ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}>
                      <span className="font-medium">
                        {new Date(payment.month + '-01').toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}
                      </span>
                      <div className="flex items-center">
                        {payment.exists ? (
                          payment.status === 'paid' ? (
                            <span className="flex items-center text-green-600 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {payment.isAdvancePayment ? 'Peşin Ödendi' : 'Ödendi'}
                            </span>
                          ) : (
                            <span className="flex items-center text-yellow-600 text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Mevcut ({payment.status})
                            </span>
                          )
                        ) : (
                          <span className="text-blue-600 text-xs font-medium">Yeni kayıt</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {amounts.isValid && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="text-sm text-green-700">
                    <div className="font-medium mb-1">💰 Ödeme Detayı:</div>
                    <div>• Her ay: {amounts.monthlyAmount.toLocaleString('tr-TR')} ₺</div>
                    <div>• Toplam: {amounts.totalPaid.toLocaleString('tr-TR')} ₺</div>
                    <div>• İşlenecek: {existingPayments.filter(p => !p.exists || p.status !== 'paid').length} ay</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p>Önizleme için daire seçin</p>
            </div>
          )}
        </div>
      </div>

      {/* Peşin Ödeme Geçmişi */}
      {historyList.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Peşin Ödeme Geçmişi ({historyList.length} kayıt)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Daire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sahibi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ödenen Aylar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toplam Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ödeme Tarihi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historyList.map((history: any, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {history.apartmentNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {history.owner}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                        {history.months.sort().map((month: string) => (
                          <span key={month} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                            {new Date(month + '-01').toLocaleDateString('tr-TR', { year: 'numeric', month: 'short' })}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {history.totalAmount.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(history.paidDate).toLocaleDateString('tr-TR')}
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

export default AdvancePayments;
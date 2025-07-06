import React, { useState } from 'react';
import { Calendar, DollarSign, Check, X, MessageCircle, Plus, Trash2, RefreshCw, Edit, Undo } from 'lucide-react';

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

interface PaymentManagementProps {
  payments: Payment[];
  apartments: any[];
  onAddPayment: (payment: Omit<Payment, 'id'>) => void;
  onUpdatePayment: (id: string, payment: Partial<Payment>) => void;
  onDeletePayment: (id: string) => void;
  onGenerateMonthlyPayments: (month: string, amount: number, dueDate: string) => void;
  onGenerateWhatsAppMessage: (apartmentId: string, payment: Payment) => void;
}

const PaymentManagement: React.FC<PaymentManagementProps> = ({
  payments,
  apartments,
  onAddPayment,
  onUpdatePayment,
  onDeletePayment,
  onGenerateMonthlyPayments,
  onGenerateWhatsAppMessage,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedApartment, setSelectedApartment] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  // Bulk payment form
  const [bulkMonth, setBulkMonth] = useState(new Date().toISOString().slice(0, 7));
  const [bulkAmount, setBulkAmount] = useState('');
  const [bulkDueDate, setBulkDueDate] = useState('');

  // Edit form
  const [editAmount, setEditAmount] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editStatus, setEditStatus] = useState<'paid' | 'pending' | 'partial'>('pending');
  const [editPaidAmount, setEditPaidAmount] = useState('');

  const currentMonth = new Date().toISOString().slice(0, 7);
  const filteredPayments = payments.filter(p => p.month === selectedMonth);

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApartment || !amount || !dueDate) return;

    const apartment = apartments.find(a => a.id === selectedApartment);
    if (!apartment) return;

    const newPayment: Omit<Payment, 'id'> = {
      apartmentId: selectedApartment,
      apartmentNumber: apartment.number,
      owner: apartment.owner,
      month: selectedMonth,
      amount: parseFloat(amount),
      status: 'pending',
      paidAmount: 0,
      dueDate,
    };

    onAddPayment(newPayment);
    setSelectedApartment('');
    setAmount('');
    setDueDate('');
    setShowForm(false);
  };

  const handleBulkGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkAmount || !bulkDueDate) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }

    if (apartments.length === 0) {
      alert('Önce daire eklemeniz gerekiyor!');
      return;
    }

    onGenerateMonthlyPayments(bulkMonth, parseFloat(bulkAmount), bulkDueDate);
    setBulkAmount('');
    setBulkDueDate('');
    setShowBulkForm(false);
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setEditAmount(payment.amount.toString());
    setEditDueDate(payment.dueDate);
    setEditStatus(payment.status);
    setEditPaidAmount(payment.paidAmount.toString());
  };

  const handleUpdateEditedPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;

    const updatedData: Partial<Payment> = {
      amount: parseFloat(editAmount),
      dueDate: editDueDate,
      status: editStatus,
      paidAmount: parseFloat(editPaidAmount),
    };

    // If status is paid, set paidAmount to amount and add paidDate
    if (editStatus === 'paid') {
      updatedData.paidAmount = parseFloat(editAmount);
      updatedData.paidDate = new Date().toISOString().split('T')[0];
    }
    // If status is pending, reset paidAmount and remove paidDate
    else if (editStatus === 'pending') {
      updatedData.paidAmount = 0;
      updatedData.paidDate = undefined;
    }
    // For partial, keep the entered paidAmount and add paidDate
    else if (editStatus === 'partial') {
      updatedData.paidDate = new Date().toISOString().split('T')[0];
    }

    onUpdatePayment(editingPayment.id, updatedData);
    setEditingPayment(null);
  };

  const handleMarkAsPaid = (payment: Payment) => {
    onUpdatePayment(payment.id, {
      status: 'paid',
      paidAmount: payment.amount,
      paidDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleRevertPayment = (payment: Payment) => {
    if (window.confirm('Bu ödemeyi geri almak istediğinizden emin misiniz?')) {
      onUpdatePayment(payment.id, {
        status: 'pending',
        paidAmount: 0,
        paidDate: undefined,
      });
    }
  };

  const handlePartialPayment = (payment: Payment, paidAmount: number) => {
    if (paidAmount <= 0) {
      alert('Ödenen tutar 0\'dan büyük olmalıdır!');
      return;
    }
    
    if (paidAmount > payment.amount) {
      alert('Ödenen tutar toplam tutardan fazla olamaz!');
      return;
    }

    const status = paidAmount >= payment.amount ? 'paid' : 'partial';
    onUpdatePayment(payment.id, {
      status,
      paidAmount,
      paidDate: new Date().toISOString().split('T')[0],
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Ödendi';
      case 'partial': return 'Kısmi';
      default: return 'Bekliyor';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Aidat Yönetimi</h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowBulkForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Toplu Aidat Oluştur
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Tekil Aidat Ekle
          </button>
        </div>
      </div>

      {/* Edit Payment Modal */}
      {editingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Aidat Düzenle - {editingPayment.apartmentNumber}
            </h3>
            <form onSubmit={handleUpdateEditedPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aidat Tutarı (₺)
                </label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Son Ödeme Tarihi
                </label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ödeme Durumu
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'paid' | 'pending' | 'partial')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Bekliyor</option>
                  <option value="partial">Kısmi Ödeme</option>
                  <option value="paid">Ödendi</option>
                </select>
              </div>
              {editStatus === 'partial' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ödenen Tutar (₺)
                  </label>
                  <input
                    type="number"
                    value={editPaidAmount}
                    onChange={(e) => setEditPaidAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    max={editAmount}
                    required
                  />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Güncelle
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPayment(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Payment Generation Form */}
      {showBulkForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 text-green-600" />
            Tüm Daireler İçin Aidat Oluştur
          </h3>
          <form onSubmit={handleBulkGenerate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ay
                </label>
                <input
                  type="month"
                  value={bulkMonth}
                  onChange={(e) => setBulkMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aidat Tutarı (₺)
                </label>
                <input
                  type="number"
                  value={bulkAmount}
                  onChange={(e) => setBulkAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Örn: 500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Son Ödeme Tarihi
                </label>
                <input
                  type="date"
                  value={bulkDueDate}
                  onChange={(e) => setBulkDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700">
                <strong>Not:</strong> Bu işlem {apartments.length} daire için aidat kaydı oluşturacaktır. 
                Zaten kayıt bulunan daireler atlanacaktır.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Toplu Oluştur
              </button>
              <button
                type="button"
                onClick={() => setShowBulkForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Individual Payment Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Plus className="h-5 w-5 mr-2 text-blue-600" />
            Tekil Aidat Ekle
          </h3>
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daire
                </label>
                <select
                  value={selectedApartment}
                  onChange={(e) => setSelectedApartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tutar (₺)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Örn: 500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Son Ödeme Tarihi
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ekle
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {new Date(selectedMonth + '-01').toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })} Aidatları
            <span className="ml-2 text-sm text-gray-500">({filteredPayments.length} kayıt)</span>
          </h3>
        </div>
        
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Bu ay için aidat kaydı bulunamadı</p>
            <button
              onClick={() => setShowBulkForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Toplu Aidat Oluştur
            </button>
          </div>
        ) : (
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
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Son Ödeme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className={`hover:bg-gray-50 ${isOverdue(payment.dueDate) && payment.status !== 'paid' ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {payment.apartmentNumber}
                      {isOverdue(payment.dueDate) && payment.status !== 'paid' && (
                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Vadesi Geçti</span>
                      )}
                      {payment.isAdvancePayment && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Peşin</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.owner}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.paidAmount > 0 && payment.status !== 'paid' ? (
                        <div>
                          <span className="text-green-600 font-medium">{payment.paidAmount.toLocaleString('tr-TR')} ₺</span>
                          <span className="text-gray-400"> / </span>
                          <span>{payment.amount.toLocaleString('tr-TR')} ₺</span>
                        </div>
                      ) : (
                        <span>{payment.amount.toLocaleString('tr-TR')} ₺</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{new Date(payment.dueDate).toLocaleDateString('tr-TR')}</div>
                        {payment.paidDate && (
                          <div className="text-xs text-green-600">
                            Ödendi: {new Date(payment.paidDate).toLocaleDateString('tr-TR')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPayment(payment)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Düzenle"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {payment.status !== 'paid' && (
                          <>
                            <button
                              onClick={() => handleMarkAsPaid(payment)}
                              className="text-green-600 hover:text-green-900"
                              title="Tam ödendi olarak işaretle"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                const amount = prompt(`Ödenen tutarı girin (₺):\nToplam: ${payment.amount} ₺\nMevcut ödeme: ${payment.paidAmount} ₺`);
                                if (amount && !isNaN(parseFloat(amount))) {
                                  handlePartialPayment(payment, parseFloat(amount));
                                }
                              }}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Kısmi ödeme gir"
                            >
                              <DollarSign className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onGenerateWhatsAppMessage(payment.apartmentId, payment)}
                              className="text-blue-600 hover:text-blue-900"
                              title="WhatsApp mesajı hazırla"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {payment.status === 'paid' && (
                          <button
                            onClick={() => handleRevertPayment(payment)}
                            className="text-orange-600 hover:text-orange-900"
                            title="Ödemeyi geri al"
                          >
                            <Undo className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeletePayment(payment.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Kaydı sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentManagement;
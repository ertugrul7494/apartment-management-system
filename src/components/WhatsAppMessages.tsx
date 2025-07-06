import React, { useState } from 'react';
import { MessageCircle, Copy, Phone, User } from 'lucide-react';

interface WhatsAppMessagesProps {
  apartments: any[];
  payments: any[];
}

const WhatsAppMessages: React.FC<WhatsAppMessagesProps> = ({ apartments, payments }) => {
  const [selectedApartment, setSelectedApartment] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');

  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'partial');
  const debtorApartments = apartments.filter(apt => 
    pendingPayments.some(p => p.apartmentId === apt.id)
  );

  const generateMessage = (apartmentId: string, messageType: 'reminder' | 'warning' | 'custom') => {
    const apartment = apartments.find(a => a.id === apartmentId);
    const apartmentPayments = pendingPayments.filter(p => p.apartmentId === apartmentId);
    
    if (!apartment || apartmentPayments.length === 0) return '';

    const totalDebt = apartmentPayments.reduce((sum, p) => sum + (p.amount - p.paidAmount), 0);
    const monthsList = apartmentPayments.map(p => 
      new Date(p.month + '-01').toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })
    ).join(', ');

    let message = '';
    
    switch (messageType) {
      case 'reminder':
        message = `Sayın ${apartment.owner},

Apartman ${apartment.number} numaralı dairenizin aşağıdaki aylara ait aidat borcunuz bulunmaktadır:

${monthsList}
Toplam Borç: ${totalDebt.toLocaleString('tr-TR')} ₺

Lütfen en kısa sürede ödemelerinizi yapınız.

Teşekkürler.
Apartman Yönetimi`;
        break;
        
      case 'warning':
        message = `Sayın ${apartment.owner},

Apartman ${apartment.number} numaralı dairenizin ${monthsList} aylarına ait ${totalDebt.toLocaleString('tr-TR')} ₺ aidat borcunuz bulunmaktadır.

Bu mesajımızdan sonra 7 gün içerisinde ödeme yapılmaması durumunda yasal süreç başlatılacaktır.

Acil ödeme yapmanızı rica ederiz.

Apartman Yönetimi`;
        break;
        
      case 'custom':
        message = customMessage.replace('{isim}', apartment.owner)
                             .replace('{daire}', apartment.number)
                             .replace('{borc}', totalDebt.toLocaleString('tr-TR'))
                             .replace('{aylar}', monthsList);
        break;
    }
    
    setGeneratedMessage(message);
    return message;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Mesaj panoya kopyalandı!');
  };

  const openWhatsApp = (phoneNumber: string, message: string) => {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? '90' + cleanPhone.slice(1) : cleanPhone;
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">WhatsApp Mesajları</h2>
        <div className="text-sm text-gray-600">
          Toplam {debtorApartments.length} borçlu daire
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Mesaj Hazırla</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daire Seç
              </label>
              <select
                value={selectedApartment}
                onChange={(e) => setSelectedApartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Daire seçin</option>
                {debtorApartments.map(apartment => {
                  const debt = pendingPayments
                    .filter(p => p.apartmentId === apartment.id)
                    .reduce((sum, p) => sum + (p.amount - p.paidAmount), 0);
                  return (
                    <option key={apartment.id} value={apartment.id}>
                      {apartment.number} - {apartment.owner} ({debt.toLocaleString('tr-TR')} ₺)
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => generateMessage(selectedApartment, 'reminder')}
                disabled={!selectedApartment}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                Hatırlatma Mesajı
              </button>
              <button
                onClick={() => generateMessage(selectedApartment, 'warning')}
                disabled={!selectedApartment}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
              >
                Uyarı Mesajı
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Özel Mesaj Şablonu
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Özel mesajınızı yazın... 
Kullanılabilir değişkenler:
{isim} - Daire sahibi adı
{daire} - Daire numarası
{borc} - Toplam borç
{aylar} - Borçlu aylar"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              />
              <button
                onClick={() => generateMessage(selectedApartment, 'custom')}
                disabled={!selectedApartment || !customMessage}
                className="mt-2 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                Özel Mesaj Oluştur
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Hazırlanan Mesaj</h3>
          
          {generatedMessage ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">
                  {generatedMessage}
                </pre>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(generatedMessage)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Kopyala
                </button>
                {selectedApartment && (
                  <button
                    onClick={() => {
                      const apartment = apartments.find(a => a.id === selectedApartment);
                      if (apartment) {
                        openWhatsApp(apartment.phone, generatedMessage);
                      }
                    }}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp'ta Aç
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Mesaj hazırlamak için yukarıdaki seçenekleri kullanın
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Borçlu Daireler</h3>
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
                  Telefon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Toplam Borç
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {debtorApartments.map((apartment) => {
                const debt = pendingPayments
                  .filter(p => p.apartmentId === apartment.id)
                  .reduce((sum, p) => sum + (p.amount - p.paidAmount), 0);
                
                return (
                  <tr key={apartment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {apartment.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{apartment.owner}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{apartment.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      {debt.toLocaleString('tr-TR')} ₺
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedApartment(apartment.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Mesaj Hazırla
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppMessages;
-- Apartment Management System Database Setup
-- Bu SQL kodunu Supabase SQL Editor'de çalıştırın

-- 1. Apartments tablosu (Daireler)
CREATE TABLE apartments (
  id SERIAL PRIMARY KEY,
  apartment_number VARCHAR(10) NOT NULL UNIQUE,
  owner_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  floor INTEGER,
  apartment_size INTEGER, -- metrekare
  monthly_fee DECIMAL(10,2) NOT NULL DEFAULT 500.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Payments tablosu (Ödemeler)
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  apartment_id INTEGER REFERENCES apartments(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- YYYY-MM formatında (örnek: 2024-01)
  amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid')),
  due_date DATE NOT NULL,
  paid_date DATE,
  payment_method VARCHAR(50), -- nakit, banka, kredi kartı vb.
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(apartment_id, month) -- Aynı daire için aynı ay tekrar etmesin
);

-- 3. Örnek veri ekleme (Test için)
INSERT INTO apartments (apartment_number, owner_name, phone, email, floor, apartment_size, monthly_fee) VALUES
('1A', 'Ahmet Yılmaz', '0532 123 4567', 'ahmet@email.com', 1, 120, 800.00),
('1B', 'Ayşe Demir', '0533 234 5678', 'ayse@email.com', 1, 85, 600.00),
('2A', 'Mehmet Kaya', '0534 345 6789', 'mehmet@email.com', 2, 100, 700.00),
('2B', 'Fatma Öz', '0535 456 7890', 'fatma@email.com', 2, 90, 650.00),
('3A', 'Ali Çelik', '0536 567 8901', 'ali@email.com', 3, 110, 750.00);

-- 4. Örnek ödeme kayıtları
INSERT INTO payments (apartment_id, month, amount, paid_amount, status, due_date, paid_date, payment_method) VALUES
-- Ocak 2025 ödemeleri
(1, '2025-01', 800.00, 800.00, 'paid', '2025-01-10', '2025-01-08', 'banka'),
(2, '2025-01', 600.00, 300.00, 'partial', '2025-01-10', '2025-01-15', 'nakit'),
(3, '2025-01', 700.00, 0.00, 'pending', '2025-01-10', NULL, NULL),
(4, '2025-01', 650.00, 650.00, 'paid', '2025-01-10', '2025-01-05', 'kredi kartı'),
(5, '2025-01', 750.00, 0.00, 'pending', '2025-01-10', NULL, NULL),

-- Şubat 2025 ödemeleri
(1, '2025-02', 800.00, 800.00, 'paid', '2025-02-10', '2025-02-07', 'banka'),
(2, '2025-02', 600.00, 0.00, 'pending', '2025-02-10', NULL, NULL),
(3, '2025-02', 700.00, 700.00, 'paid', '2025-02-10', '2025-02-12', 'nakit'),
(4, '2025-02', 650.00, 400.00, 'partial', '2025-02-10', '2025-02-20', 'banka'),
(5, '2025-02', 750.00, 750.00, 'paid', '2025-02-10', '2025-02-09', 'kredi kartı'),

-- Mart 2025 ödemeleri (bazıları vadesi geçmiş)
(1, '2025-03', 800.00, 800.00, 'paid', '2025-03-10', '2025-03-08', 'banka'),
(2, '2025-03', 600.00, 0.00, 'pending', '2025-03-10', NULL, NULL),
(3, '2025-03', 700.00, 200.00, 'partial', '2025-03-10', '2025-03-25', 'nakit'),
(4, '2025-03', 650.00, 0.00, 'pending', '2025-03-10', NULL, NULL),
(5, '2025-03', 750.00, 750.00, 'paid', '2025-03-10', '2025-03-11', 'banka'),

-- Nisan 2025 ödemeleri (bazıları vadesi geçmiş)
(1, '2025-04', 800.00, 0.00, 'pending', '2025-04-10', NULL, NULL),
(2, '2025-04', 600.00, 600.00, 'paid', '2025-04-10', '2025-04-15', 'nakit'),
(3, '2025-04', 700.00, 0.00, 'pending', '2025-04-10', NULL, NULL),
(4, '2025-04', 650.00, 300.00, 'partial', '2025-04-10', '2025-04-20', 'kredi kartı'),
(5, '2025-04', 750.00, 750.00, 'paid', '2025-04-10', '2025-04-08', 'banka'),

-- Mayıs 2025 ödemeleri (bazıları vadesi geçmiş)
(1, '2025-05', 800.00, 800.00, 'paid', '2025-05-10', '2025-05-05', 'banka'),
(2, '2025-05', 600.00, 0.00, 'pending', '2025-05-10', NULL, NULL),
(3, '2025-05', 700.00, 0.00, 'pending', '2025-05-10', NULL, NULL),
(4, '2025-05', 650.00, 650.00, 'paid', '2025-05-10', '2025-05-12', 'nakit'),
(5, '2025-05', 750.00, 400.00, 'partial', '2025-05-10', '2025-05-18', 'kredi kartı'),

-- Haziran 2025 ödemeleri (bazıları vadesi geçmiş)
(1, '2025-06', 800.00, 800.00, 'paid', '2025-06-10', '2025-06-08', 'banka'),
(2, '2025-06', 600.00, 0.00, 'pending', '2025-06-10', NULL, NULL),
(3, '2025-06', 700.00, 350.00, 'partial', '2025-06-10', '2025-06-25', 'nakit'),
(4, '2025-06', 650.00, 0.00, 'pending', '2025-06-10', NULL, NULL),
(5, '2025-06', 750.00, 750.00, 'paid', '2025-06-10', '2025-06-07', 'banka'),

-- Temmuz 2025 ödemeleri (güncel ay)
(1, '2025-07', 800.00, 0.00, 'pending', '2025-07-10', NULL, NULL),
(2, '2025-07', 600.00, 0.00, 'pending', '2025-07-10', NULL, NULL),
(3, '2025-07', 700.00, 0.00, 'pending', '2025-07-10', NULL, NULL),
(4, '2025-07', 650.00, 650.00, 'paid', '2025-07-10', '2025-07-02', 'kredi kartı'),
(5, '2025-07', 750.00, 0.00, 'pending', '2025-07-10', NULL, NULL);

-- 5. Indexes for better performance
CREATE INDEX idx_payments_apartment_id ON payments(apartment_id);
CREATE INDEX idx_payments_month ON payments(month);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due_date ON payments(due_date);

-- 6. Updated_at otomatik güncelleme için trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Triggers
CREATE TRIGGER update_apartments_updated_at BEFORE UPDATE ON apartments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

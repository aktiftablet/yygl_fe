YYGL
general ledger for yüzyüze

## API Endpoints

### POST /savetransaction

Ödeme işlemlerini muhasebe defterine kaydeden endpoint.

> Not: Güncel uygulama route’u `POST /api/transactions` (bkz. `main.go`).

#### Request Body

```json
{
  "amount": 1000.00,
  "payer_id": 123,
  "reciever_id": 456,
  "pym_facilitator": "payment_gateway",
  "commision": 5,
  "kdv": 20,
  "stopaj": 15,
  "timestamp": "2024-01-15T10:30:00Z",
  "call_id": "unique-call-id-123"
}
```

**Alanlar:**
- `amount` (float64): Toplam ödeme tutarı
- `payer_id` (int64): Ödeme yapan kullanıcı ID'si
- `reciever_id` (int64): Ödeme alan kullanıcı ID'si
- `pym_facilitator` (string): Ödeme sağlayıcı adı
- `commision` (int): Komisyon yüzdesi
- `kdv` (int): KDV yüzdesi
- `stopaj` (int): Stopaj yüzdesi
- `timestamp` (string): İşlem zamanı (RFC3339 formatında)
- `call_id` (string): Benzersiz çağrı ID'si

#### İşleyiş

1. **Transaction Başlatma**: Tüm işlemler tek bir database transaction içinde gerçekleştirilir.

2. **GL Account ID'lerini Alma**: Veritabanından aşağıdaki GL hesap kodlarına ait ID'ler alınır:
   - `COMMISSION`: Komisyon hesabı
   - `KDV`: KDV hesabı
   - `STOPAJ`: Stopaj hesabı

3. **Hesaplamalar**:
   - `commissionValue = amount * (commission / 100)`
   - `kdvValue = commissionValue * (kdv / 100)`
   - `stopajValue = (amount - commissionValue) * (stopaj / 100)`
   - `receiverValue = amount - commissionValue - kdvValue - stopajValue`

4. **Accounting Document Oluşturma**:
   - `fiscal_year`: Timestamp'ten alınan yıl
   - `doc_no`: `ledger.next_doc_no(fiscal_year)` fonksiyonu ile otomatik oluşturulur
   - `doc_date`: Request'teki timestamp
   - `posting_date`: İşlem zamanı
   - `description`: Otomatik oluşturulan açıklama
   - `ref`: `call_id` değeri

5. **Accounting Items Oluşturma**: Aşağıdaki muhasebe kalemleri oluşturulur:
   - **Payer** (Debit): Toplam ödeme tutarı - kullanıcıdan tahsil edilen
   - **Commission** (Credit): Komisyon tutarı (GL Account ID ile)
   - **KDV** (Credit): KDV tutarı (GL Account ID ile)
   - **Stopaj** (Credit): Stopaj tutarı (GL Account ID ile)
   - **Receiver** (Credit): Alıcıya giden net tutar

6. **Transaction Commit**: Tüm işlemler başarılı olursa transaction commit edilir. Herhangi bir hata durumunda tüm işlemler rollback edilir (atomicity garantisi).

#### Response

**Başarılı (200 OK):**
```json
{
  "message": "Transaction saved successfully",
  "document_id": 12345
}
```

**Hata (400 Bad Request / 500 Internal Server Error):**
```json
{
  "error": "Error message description"
}
```

#### Transaction Yönetimi

- Tüm database işlemleri tek bir transaction içinde gerçekleştirilir
- Herhangi bir hata durumunda tüm değişiklikler otomatik olarak rollback edilir
- `accounting_document` ve `accounting_item` kayıtları birlikte commit edilir veya hiçbiri kaydedilmez
- Veri tutarlılığı garanti altındadır

---

### POST /api/transactions/:document_id/reverse

`saveTransactionHandler` ile oluşturulmuş bir muhasebe kaydını **ters kayıt** ile iptal eder.

#### Path Param

- `document_id` (int64): Ters kaydı alınacak `ledger.accounting_document.id`

#### İşleyiş

- Orijinal document ve item’lar okunur.
- Yeni bir `ledger.accounting_document` oluşturulur:
  - `doc_no`: `ledger.next_doc_no(fiscal_year)` ile üretilir
- Orijinal belgenin `ref` alanı **değiştirilmez**. Ters kayıt belgesi de aynı `ref` değerini taşır.
- İlişkilendirme/idempotency için `ledger.accounting_document.reversal` alanı kullanılır:
  - Orijinal belge: `reversal = <ters_belge_id>`
  - Ters belge: `reversal = <orijinal_belge_id>`
- Orijinal item’lar yeni document’a kopyalanır ancak **DCIndicator ters çevrilir**:
  - `D` → `C`
  - `C` → `D`
- Tüm işlemler tek transaction içinde commit edilir; hata olursa rollback edilir.

#### Response

**Başarılı (200 OK):**

```json
{
  "success": true,
  "message": "Transaction reversed successfully",
  "data": {
    "original_document_id": 12345,
    "reversal_document_id": 67890,
    "ref": "unique-call-id-123"
  }
}
```

**Zaten reverse edilmiş (409 Conflict):**

```json
{
  "error": "Document already reversed",
  "reversal_document_id": 67890
}
```

**Bulunamadı (404 Not Found):**

```json
{
  "error": "Original document not found"
}
```

---

### GET /api/transactions

Raporlama/liste ekranları için hafif, hızlı, pagination’lı transaction listesi.

#### Query Params

- `page` (int, default: 1)
- `limit` (int, default: 50, max: 200)
- `from` (string, `YYYY-MM-DD`): `posting_date >= from`
- `to` (string, `YYYY-MM-DD`): `posting_date <= to` (gün sonu dahil)

#### Response (200 OK)

```json
{
  "success": true,
  "page": 1,
  "limit": 50,
  "data": [
    {
      "id": 12345,
      "fiscal_year": 2024,
      "doc_no": 1000001,
      "doc_date": "2024-01-15T10:30:00Z",
      "posting_date": "2024-01-15T10:31:12Z",
      "description": "Payment from 123 to 456 via payment_gateway",
      "ref": "unique-call-id-123",
      "reversal": 67890,
      "debit_total": "1000.00",
      "credit_total": "1000.00"
    }
  ]
}
```

---

### GET /api/transactions/:document_id

Tek bir transaction kaydının tüm detaylarını (document + item’lar) döner.

#### Path Param

- `document_id` (int64): `ledger.accounting_document.id`

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "document": {
      "id": 12345,
      "fiscal_year": 2024,
      "doc_no": 1000001,
      "doc_date": "2024-01-15T10:30:00Z",
      "posting_date": "2024-01-15T10:31:12Z",
      "description": "Payment from 123 to 456 via payment_gateway",
      "ref": "unique-call-id-123",
      "reversal": 67890
    },
    "items": [
      {
        "line_no": 1,
        "account_code": "PAYER",
        "amount": "1000.00",
        "dc_indicator": "D",
        "currency": "TRY",
        "user_id": 123,
        "description": "Total payment debit from payer"
      }
    ]
  }
}
```

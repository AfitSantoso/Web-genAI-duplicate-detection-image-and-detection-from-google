# API Documentation - GenAI Document Duplicate & Fraud Detection
This document provides a comprehensive overview of the APIs developed for the Document Duplicate & Fraud Detection system.
The system consists of two API versions/services:

1. **Fraud Detection API v4.0 (Role-Based, AI-Enhanced, FIKTIF/ASLI Conclusion)**
2. **Document Duplicate Detection API (v1 / Legacy)**

All APIs generally follow a standard JSON response format:
```json
// Success Response
{
  "success": true,
  "message": "Deskripsi hasil sukses",
  "data": { ... }
}

// Error Response
{
  "success": false,
  "message": "Pesan error (detail permasalahan)",
  "data": {}
}
```

---

## 1. Fraud Detection API v4.0
**File Utama**: `apiFraudDetection.py`
API sistem deteksi fraud yang mendukung arsitektur berbasis Role (CMO, BM, dan AUDIT) dengan AI-Enhanced Deep Analysis dan kesimpulan binary **FIKTIF/ASLI**.

### Roles & Flow
- **CMO (Credit Marketing Officer)**: Upload dokumen customer → Menerima response **status upload** saja (tanpa detail FRIDAYS Score).
- **BM (Branch Manager)**: Review detail FRIDAYS Score, breakdown per dokumen, submit fraud review.
- **AUDIT (Internal Audit)**: Dashboard summary per CMO → drill-down ke customer → detail dokumen bermasalah. Monitoring performa dan integritas CMO.

> **Catatan Penting**: CMO hanya mendapat response bahwa dokumen berhasil diupload. Detail analisis FRIDAYS Score (breakdown, similarity percentage, fraud patterns) hanya dapat dilihat oleh **BM** dan **AUDIT**.

### Authentication
Semua endpoint CMO, BM, dan AUDIT membutuhkan header otentikasi:
- `X-User-Id`: ID pengguna (diperoleh dari response login).
- `X-User-Role`: Role pengguna (`CMO`, `BM`, atau `AUDIT`).

---

### 1.1 Auth Endpoints

#### **POST** `/auth/login`
- **Deskripsi**: Login untuk CMO, BM, atau AUDIT.
- **Request (Multipart Form / Form URL Encoded)**:
  ```json
  {
    "nip": "CMO001",
    "password": "Cmo@12345",
    "role": "CMO"
  }
  ```
- **Default Credentials**:
  | Role | NIP | Password |
  |------|-----|----------|
  | CMO | CMO001 - CMO005 | `Cmo@12345` |
  | BM | BM001 | `Bm@12345` |
  | AUDIT | AUD001 | `Audit@12345` |

- **Response**:
  ```json
  {
    "success": true,
    "message": "Login berhasil sebagai CMO: Ahmad Rizki",
    "data": {
      "user_id": 1,
      "role": "CMO",
      "name": "Ahmad Rizki",
      "nip": "CMO001",
      "instructions": "Kirim header X-User-Id dan X-User-Role di setiap request"
    }
  }
  ```

---

### 1.2 CMO Endpoints

*(Jangan lupa sertakan header `X-User-Id` dan `X-User-Role`)*

#### **GET** `/cmo/profile`
- **Deskripsi**: Mendapatkan profile CMO yang sedang login.
- **Response**:
  ```json
  {
    "success": true,
    "message": "Profile CMO",
    "data": {
      "id": 1,
      "nip": "CMO001",
      "name": "Budi Santoso",
      "area": "Jakarta"
    }
  }
  ```

#### **POST** `/cmo/customer`
- **Deskripsi**: Membuat record customer baru untuk CMO saat ini.
- **Request (Multipart Form / Form URL Encoded)**:
  ```json
  // Representasi form-data:
  {
    "name": "Andi Darmawan"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Customer 'Andi Darmawan' berhasil dibuat dengan no kontrak CNT-000001",
    "data": {
      "id": 1,
      "no_contract": "CNT-000001",
      "name": "Andi Darmawan",
      "cmo_id": 1
    }
  }
  ```

#### **POST** `/cmo/customer/{customer_id}/upload-document`
- **Deskripsi**: Upload satu jenis dokumen customer (di-check duplikasi internal db).
- **Request (Multipart Form)**:
  Untuk Android, gunakan `MultipartBody.Part` untuk `file`, dan `RequestBody` untuk `document_type`:
  - `document_type` (text): `KTP`, `NPWP`, `PBB`, `SLIPGAJI`, `MUTASI`, `LISTRIK`
  - `file` (image file): File gambar dokumen.
- **Response**:
  ```json
  {
    "success": true,
    "message": "Dokumen KTP berhasil diupload untuk customer CNT-000001",
    "data": {
      "document_id": "uuid-1234-abcd",
      "document_type": "KTP",
      "customer_id": 1,
      "detection_status": "POTENTIAL_DUPLICATE",
      "is_flagged": true
    }
  }
  ```

#### **POST** `/cmo/customer/{customer_id}/upload-all`
- **Deskripsi**: Upload semua dokumen dan bukti customer secara sekaligus. CMO mendapat response **status upload saja**. Detail analisis FRIDAYS Score disimpan di database dan hanya dapat dilihat oleh **BM** dan **AUDIT**.
- **Request (Multipart Form)**: *Semua field bersifat opsional, isi jika filenya ada*
  - `file_ktp`: `File`
  - `file_npwp`: `File`
  - `file_pbb`: `File`
  - `file_slipgaji`: `File`
  - `file_mutasi`: `File`
  - `file_listrik`: `File` *(Tagihan Listrik)*
  - `file_tempat_tinggal`: `File`
  - `file_usaha`: `File`
- **Response (CMO — Simplified Upload Status)**:
  ```json
  {
    "success": true,
    "message": "Berhasil upload 7 dokumen/bukti untuk customer CNT-000001 - Andi Darmawan",
    "data": {
      "customer_id": 1,
      "customer_no_contract": "CNT-000001",
      "customer_name": "Andi Darmawan",
      "uploaded_by": "CMO001",
      "documents": {
        "KTP": {
          "status": "✅ uploaded",
          "document_id": "uuid-...",
          "filename": "ktp_andi.jpg"
        },
        "NPWP": {
          "status": "✅ uploaded",
          "document_id": "uuid-...",
          "filename": "npwp_andi.jpg"
        },
        "PBB": {
          "status": "✅ uploaded",
          "document_id": "uuid-...",
          "filename": "pbb_andi.jpg"
        },
        "SLIPGAJI": {
          "status": "✅ uploaded",
          "document_id": "uuid-...",
          "filename": "slip_andi.jpg"
        },
        "MUTASI": {
          "status": "✅ uploaded",
          "document_id": "uuid-...",
          "filename": "mutasi_andi.jpg"
        },
        "LISTRIK": {
          "status": "✅ uploaded",
          "document_id": "uuid-...",
          "filename": "listrik_andi.jpg"
        }
      },
      "proofs": {
        "TEMPAT_TINGGAL": {
          "status": "✅ uploaded & checked",
          "proof_id": "uuid-...",
          "filename": "rumah_andi.jpg"
        },
        "USAHA": {
          "status": "✅ uploaded & checked",
          "proof_id": "uuid-...",
          "filename": "usaha_andi.jpg"
        }
      },
      "summary": {
        "total_uploaded": 8,
        "total_skipped": 0
      },
      "timestamp": "2026-03-30T10:30:00"
    }
  }
  ```

> **Catatan v4.0**: CMO **hanya mendapat response upload status**. Detail FRIDAYS Score (breakdown, fraud patterns, kesimpulan FIKTIF/ASLI) di-process di background dan **disimpan ke database**. Detail tersebut hanya dapat diakses oleh BM via `GET /bm/customer/{id}/fraud-result` dan AUDIT via `GET /audit/customer/{id}/fraud-result`.

#### **POST** `/cmo/customer/{customer_id}/upload-bulk` *(BARU v3.0)*
- **Deskripsi**: **Bulk Upload dengan Auto-Classification** — Upload banyak dokumen sekaligus **TANPA label**. Sistem otomatis mengklasifikasikan tipe setiap dokumen menggunakan OCR + visual AI, menyaring dokumen yang tidak relevan, dan memproses dokumen yang dikenali.
- **Use Case**: Cocok untuk skenario di mana CMO menerima 1 folder penuh dokumen dari pemohon kredit, termasuk dokumen-dokumen yang **bukan** termasuk parameter (misal: formulir pengajuan kredit, surat keterangan, dll). Sistem cerdas memilah mana yang relevan.
- **Request (Multipart Form)**: *Kirim banyak file sekaligus dengan field name apapun*
  - `files` atau nama field apapun: Multiple `File` uploads (max 20 file, max 10MB per file)
  - Supported: JPG, JPEG, PNG, BMP, TIFF, WEBP
- **Proses Internal**:
  1. **Auto-Classification** — Setiap file di-scan OCR dan dianalisis visual untuk menentukan tipe dokumen
  2. **Smart Slicing** — Dokumen yang tidak cocok dengan parameter (KTP/NPWP/PBB/SLIPGAJI/MUTASI/LISTRIK/TEMPAT_TINGGAL/USAHA) akan di-skip
  3. **Detection Pipeline** — Dokumen yang dikenali diproses melalui pipeline deteksi duplikat standar. **OCR di-skip otomatis untuk foto (TEMPAT_TINGGAL, USAHA)** untuk menghemat waktu.
  4. **FRIDAYS Score** — Dihitung berdasarkan dokumen yang berhasil diproses, dengan **kesimpulan binary FIKTIF/ASLI**
- **Response (CMO — Upload Status + Classification Summary)**:
  ```json
  {
    "success": true,
    "message": "Bulk upload selesai: 5 dokumen berhasil diproses, 3 file di-skip (tidak dikenali) untuk customer CNT-000001 - Andi Darmawan",
    "data": {
      "customer_id": 1,
      "customer_no_contract": "CNT-000001",
      "customer_name": "Andi Darmawan",
      "uploaded_by": "CMO001",
      "session_id": "uuid-session-...",
      "upload_mode": "BULK_AUTO_CLASSIFIED",
      "classification_summary": {
        "total_files": 8,
        "classified_count": 5,
        "skipped_count": 3,
        "types_found": ["KTP", "NPWP", "PBB", "SLIPGAJI", "MUTASI"],
        "duplicate_types": [],
        "classification_time_ms": 4500.0
      },
      "documents": {
        "KTP": {
          "status": "✅ uploaded (auto-classified)",
          "document_id": "uuid-...",
          "filename": "doc_001.jpg",
          "auto_classified": true,
          "classification_confidence": 0.92
        },
        "NPWP": {
          "status": "✅ uploaded (auto-classified)",
          "document_id": "uuid-...",
          "filename": "doc_002.jpg",
          "auto_classified": true,
          "classification_confidence": 0.87
        }
      },
      "proofs": {},
      "skipped_files": [
        {
          "filename": "formulir_kredit.jpg",
          "file_size": 245000,
          "skip_reason": "Skor klasifikasi terlalu rendah (best: KTP=1.2, threshold=4.0). Dokumen tidak cocok dengan kategori KTP/NPWP/PBB/SLIPGAJI/MUTASI/LISTRIK.",
          "best_guess": "KTP",
          "confidence": 0.15
        },
        {
          "filename": "surat_keterangan.jpg",
          "file_size": 180000,
          "skip_reason": "Skor klasifikasi terlalu rendah. Dokumen tidak cocok dengan kategori parameter.",
          "best_guess": "UNKNOWN",
          "confidence": 0.0
        }
      ],
      "summary": {
        "total_uploaded": 5,
        "total_skipped": 3,
        "total_files_received": 8
      },
      "timestamp": "2026-04-17T10:30:00"
    }
  }
  ```

> **Catatan Bulk Upload v4.0**:
> - Dokumen yang **tidak dikenali** (formulir pengajuan kredit, surat keterangan, dll) akan di-**skip** tanpa error, dengan alasan skip yang jelas.
> - Jika ada **>1 file** untuk tipe yang sama (misal: 2 file KTP), sistem memilih yang memiliki **confidence tertinggi**.
> - Auto-classification menggunakan **3-Layer AI**: ResNet-18 Embedding Similarity (45%), OCR Keyword Matching (40%), Visual Heuristic + Filename (15%).
> - **Optimasi v4.0**: OCR otomatis di-skip untuk file foto (TEMPAT_TINGGAL, USAHA) jika embedding sudah yakin — hemat 2-8 detik per foto.
> - Endpoint ini **kompatibel** dengan endpoint `upload-all` — hasil deteksi dan FRIDAYS Score tersimpan di database yang sama.

#### **GET** `/cmo/customers`
- **Deskripsi**: Mengambil daftar semua customer di bawah naungan CMO yang sedang login.
- **Response**:
  ```json
  {
    "success": true,
    "message": "Data customer",
    "data": [
      {
        "id": 1,
        "no_contract": "CNT-000001",
        "name": "Andi Darmawan",
        "fraud_status": "FLAGGED"
      }
    ]
  }
  ```

---

### 1.3 BM Endpoints
*(Membutuhkan header `X-User-Role: BM`)*

#### **GET** `/bm/dashboard`
- **Deskripsi**: Dashboard fraud review dengan statistik keseluruhan.

#### **GET** `/bm/cmo-list`
- **Deskripsi**: Daftar semua CMO beserta fraud summary (total customer, flagged, confirmed fraud).

#### **GET** `/bm/cmo/{cmo_id}/customers`
- **Deskripsi**: List customer milik CMO tertentu.

#### **GET** `/bm/flagged-customers`
- **Deskripsi**: Customer yang teridentifikasi fraud (duplikat dokumen).

#### **GET** `/bm/google-flagged`
- **Deskripsi**: Customer yang bukti foto-nya terdeteksi dari Google/internet.

#### **GET** `/bm/customer/{customer_id}/fraud-result`
- **Deskripsi**: **Detail lengkap FRIDAYS Score** untuk customer. Endpoint ini menampilkan breakdown AI per dokumen/bukti yang tersimpan dari proses upload CMO. Bisa diakses oleh BM maupun AUDIT.
- **Response (FRIDAYS Score — AI-Enhanced Deep Analysis)**:
  ```json
  {
    "success": true,
    "message": "Detail FRIDAYS Score untuk CNT-000001 - Andi Darmawan",
    "data": {
      "customer": {
        "id": 1,
        "no_contract": "CNT-000001",
        "name": "Andi Darmawan",
        "fraud_status": "FLAGGED",
        "cmo_name": "Ahmad Rizki",
        "cmo_nip": "CMO001"
      },
      "fridays_score": {
        "score": 0.875,
        "score_percentage": 87.5,
        "decision": "REJECT",
        "risk_level": "CRITICAL_RISK",
        "total_flagged": 5,
        "any_fraud_detected": true,
        "calculated_at": "2026-03-30T10:30:00",
        "conclusion": "FIKTIF",
        "conclusion_summary": "3/8 dokumen fiktif",
        "conclusion_detail": {
          "is_fiktif": true,
          "total_checked": 8,
          "total_fiktif": 3,
          "total_asli": 5,
          "fiktif_documents": ["KTP", "MUTASI", "TEMPAT_TINGGAL"],
          "asli_documents": ["NPWP", "PBB", "SLIPGAJI", "LISTRIK", "USAHA"],
          "explanation": "Dari 8 dokumen yang dicek, ditemukan 3 dokumen fiktif: KTP, MUTASI, TEMPAT_TINGGAL. Karena ada dokumen fiktif, kesimpulan keseluruhan: FIKTIF."
        }
      },
      "breakdown": [
        {
          "component": "KTP",
          "category": "DOCUMENT",
          "weight": 0.25,
          "raw_score": 1.0,
          "weighted_score": 0.25,
          "similarity_percentage": 100.0,
          "status": "UPLOADED",
          "detection_status": "INSTANT_DUPLICATE",
          "detection_confidence": 1.0,
          "matched_fields": [
            {
              "field": "Nomor Induk Kependudukan (NIK)",
              "field_key": "NIK",
              "value_preview": "3201****0123",
              "is_match": true,
              "similarity_percentage": 100.0,
              "detail": "NIK identik dengan dokumen di database"
            },
            {
              "field": "Nama Lengkap",
              "field_key": "NAMA",
              "value_preview": "ANDI****RMAN",
              "is_match": true,
              "similarity_percentage": 100.0,
              "detail": "Nama Lengkap identik"
            }
          ],
          "comparison_summary": "Dokumen KTP DUPLIKAT 100%: Kesamaan pada NIK, Nama Lengkap",
          "fraud_patterns": [
            "NIK 3201****0123 → Kode provinsi: 32, Kode kabupaten/kota: 01"
          ],
          "note": "⚠️ Dokumen DUPLIKAT PERSIS ditemukan di database!"
        },
        {
          "component": "MUTASI",
          "category": "DOCUMENT",
          "similarity_percentage": 100.0,
          "detection_status": "INSTANT_DUPLICATE",
          "matched_fields": [
            { "field": "Nomor Rekening", "similarity_percentage": 100.0, "is_match": true },
            { "field": "Total Nilai Transaksi", "similarity_percentage": 100.0, "is_match": true },
            { "field": "Jumlah Baris Transaksi", "similarity_percentage": 100.0 }
          ],
          "fraud_patterns": [
            "Pola fraud MUTASI: Ditemukan 12 transaksi dengan angka identik. Kemungkinan hanya mengganti nama nasabah..."
          ]
        },
        {
          "component": "TEMPAT_TINGGAL",
          "category": "PROOF",
          "similarity_percentage": 65.0,
          "google_lens_status": "FROM_INTERNET",
          "top_similar_matches": [
            {
              "rank": 1,
              "source": "rumah123.com",
              "title": "Rumah Dijual di Bandung",
              "similarity_percentage": 65.0,
              "similarity_description": "Foto rumah ditemukan di situs jual-beli properti — bentuk bangunan identik"
            },
            {
              "rank": 2,
              "source": "shutterstock.com",
              "similarity_percentage": 54.6,
              "similarity_description": "Foto dari stock photo — kemungkinan bukan foto asli"
            }
          ],
          "visual_analysis": "AI mendeteksi foto dari internet. Top match: rumah123.com (65.0% mirip)."
        }
      ]
    }
  }
  ```

> **Catatan FRIDAYS v4.0 (AI-Powered Deep Analysis + Kesimpulan FIKTIF/ASLI)**:
> - **🆕 Kesimpulan Binary (v4.0)**: Field `conclusion` menunjukkan **FIKTIF** atau **ASLI**. Jika **salah satu saja** dari seluruh dokumen terdeteksi fiktif (duplikat/dari internet), kesimpulan = **FIKTIF**. Contoh: `"3/8 dokumen fiktif"` — tanpa persentase per-dokumen.
> - **Dokumen (KTP, NPWP, PBB, SLIPGAJI, MUTASI, LISTRIK)**: Setiap komponen breakdown menyertakan:
>   - `similarity_percentage` (0-100%): Tingkat kemiripan keseluruhan
>   - `matched_fields`: Array field yang cocok, **setiap field memiliki `similarity_percentage` (0-100%)**
>   - `comparison_summary`: Ringkasan AI
>   - `fraud_patterns`: Pola fraud yang terdeteksi AI (MUTASI: angka identik, KTP: kode provinsi, PBB: lokasi objek)
> - **Bukti (TEMPAT_TINGGAL, USAHA)**: Menyertakan:
>   - `top_similar_matches`: **Top 3 sumber mirip** dari internet + AI description
>   - `visual_analysis`: Analisis AI visual. **OCR di-skip otomatis** untuk foto (hemat waktu)
> - **`conclusion_detail.fiktif_documents`**: Array nama dokumen yang terdeteksi fiktif (KTP, MUTASI, dll)
> - **`conclusion_detail.asli_documents`**: Array nama dokumen yang aman/asli

#### **POST** `/bm/review/{customer_id}`
- **Deskripsi**: Submit review keputusan fraud untuk customer.
- **Request (Form)**:
  - `review_status`: `FLAGGED` / `CLEAN` / `CONFIRMED_FRAUD`
  - `review_notes`: Catatan review (opsional)

#### **GET** `/bm/customer/{customer_id}/reviews`
- **Deskripsi**: Riwayat review fraud untuk customer tertentu.

---

### 1.4 AUDIT Endpoints
*(Membutuhkan header `X-User-Role: AUDIT`)*

> AUDIT adalah user internal yang bertugas memonitor kualitas kerja CMO dan mengaudit hasil deteksi fraud. AUDIT memiliki akses read-only untuk melihat semua data.

#### **GET** `/audit/dashboard`
- **Deskripsi**: Dashboard utama audit dengan statistik dan summary per CMO.
- **Response**:
  ```json
  {
    "success": true,
    "message": "Dashboard Internal Audit",
    "data": {
      "audit_user": { "id": 1, "name": "Gita Auditor", "nip": "AUD001" },
      "overview": {
        "total_cmo": 5,
        "total_cmo_with_fraud": 3,
        "total_customers": 150,
        "total_fraud_documents": 12,
        "flagged_customers": 8,
        "confirmed_fraud": 4
      },
      "cmo_fraud_summary": [
        {
          "cmo_id": 1,
          "cmo_name": "Ahmad Rizki",
          "nip": "CMO001",
          "area": "Jakarta Selatan",
          "total_customers": 30,
          "flagged_count": 5,
          "confirmed_fraud_count": 2,
          "clean_count": 20,
          "pending_count": 3,
          "total_fraud_documents": 7
        }
      ]
    }
  }
  ```

#### **GET** `/audit/cmo-list`
- **Deskripsi**: Daftar semua CMO beserta jumlah dokumen tidak valid. Untuk AUDIT melihat CMO mana yang banyak fraud.
- **Response**:
  ```json
  {
    "success": true,
    "message": "Daftar 5 CMO untuk audit",
    "data": {
      "total": 5,
      "cmo_list": [
        {
          "cmo_id": 1,
          "cmo_name": "Ahmad Rizki",
          "nip": "CMO001",
          "area": "Jakarta Selatan",
          "total_customers": 30,
          "flagged_count": 5,
          "confirmed_fraud_count": 2,
          "total_fraud_documents": 7
        }
      ]
    }
  }
  ```

#### **GET** `/audit/cmo/{cmo_id}/customers`
- **Deskripsi**: List customer milik CMO tertentu beserta jumlah dokumen tidak valid per customer. **Drill-down**: Audit pilih CMO → Muncul list customer.
- **Response**:
  ```json
  {
    "success": true,
    "message": "Customer milik CMO CMO001 - Ahmad Rizki",
    "data": {
      "cmo": { "id": 1, "name": "Ahmad Rizki", "nip": "CMO001", "area": "Jakarta Selatan" },
      "total_customers": 30,
      "customers": [
        {
          "customer_id": 1,
          "no_contract": "CNT-000001",
          "customer_name": "Andi Darmawan",
          "fraud_status": "FLAGGED",
          "score_percentage": 87.5,
          "decision": "REJECT",
          "risk_level": "CRITICAL_RISK",
          "total_flagged": 5,
          "any_fraud_detected": true,
          "fridays_calculated_at": "2026-03-30T10:30:00"
        }
      ]
    }
  }
  ```

#### **GET** `/audit/customer/{customer_id}/fraud-result`
- **Deskripsi**: **Detail terdalam** — menampilkan breakdown FRIDAYS Score customer beserta kesimpulan **FIKTIF/ASLI**, customer info (no_contract, name), CMO info, per-field similarity, fraud patterns, dan review history. Flow: Audit → CMO → Customer → **Detail ini**.
- **Response**: Sama seperti `GET /bm/customer/{id}/fraud-result` (lihat di atas) + tambahan `review_history`.

---

## 2. Document Duplicate Detection API (v1 / Legacy)
API yang ini bersifat Public tanpa Auth (tanpa header `X-User-Id` / `X-User-Role`). Berguna untuk mengecek duplikat secara mandiri.

#### **POST** `/detect-duplicate`
- **Deskripsi**: Cek status duplikat gambar tanpa menyimpannya ke database.
- **Request (Multipart Form)**:
  - `file`: File gambar
- **Response**:
  ```json
  {
    "success": true,
    "message": "Gambar berpotensi duplikat (kemiripan visual tinggi)",
    "data": {
      "filename": "ktp_user.jpg",
      "document_type": "KTP",
      "detection_result": {
        "status": "POTENTIAL_DUPLICATE",
        "confidence": 0.92,
        "matched_document_id": "abc-123"
      }
    }
  }
  ```

---

## 📱 Catatan Implementasi Android (Retrofit)
Untuk mempermudah integrasi di Android, berikut susunan fungsi contoh menggunakan **Retrofit**:

```kotlin
interface ApiService {
    // 1. Auth Endpoint (Gunakan Field)
    @FormUrlEncoded
    @POST("/auth/login")
    suspend fun login(
        @Field("nip") nip: String,
        @Field("password") pass: String,
        @Field("role") role: String
    ): Response<BaseResponse<LoginData>>

    // 2. Upload Document CMO (Multipart)
    // Ingat menambahkan header menggunakan Interceptor di OkHttp
    @Multipart
    @POST("/cmo/customer/{customer_id}/upload-document")
    suspend fun uploadDocument(
        @Path("customer_id") customerId: Int,
        @Part("document_type") docType: RequestBody,
        @Part file: MultipartBody.Part
    ): Response<BaseResponse<UploadResponseData>>

    // 3. Upload All Documents & Proofs (Multipart, semua opsional)
    @Multipart
    @POST("/cmo/customer/{customer_id}/upload-all")
    suspend fun uploadAllDocuments(
        @Path("customer_id") customerId: Int,
        @Part fileKtp: MultipartBody.Part?,
        @Part fileNpwp: MultipartBody.Part?,
        @Part filePbb: MultipartBody.Part?,
        @Part fileSlipgaji: MultipartBody.Part?,
        @Part fileMutasi: MultipartBody.Part?,
        @Part fileListrik: MultipartBody.Part?,
        @Part fileTempatTinggal: MultipartBody.Part?,
        @Part fileUsaha: MultipartBody.Part?
    ): Response<BaseResponse<UploadAllResponseData>>
    
    // 4. Get CMO Data
    @GET("/cmo/customers")
    suspend fun getMyCustomers(): Response<BaseResponse<List<CustomerData>>>
}
```

### Model Data untuk Breakdown (Kotlin)
```kotlin
// Response data dari BM/Audit fraud-result
data class FridaysScoreResponse(
    val customer_id: Int,
    val customer_no_contract: String,
    val fridays_score: FridaysScore
)

data class FridaysScore(
    val score: Double,
    val score_percentage: Double,
    val decision: String,
    val risk_level: RiskLevel,
    val breakdown: List<BreakdownItem>,
    // ✅ BARU v4.0: Kesimpulan FIKTIF/ASLI
    val conclusion: String?,              // "FIKTIF" atau "ASLI"
    val conclusion_summary: String?,      // "3/8 dokumen fiktif"
    val conclusion_detail: ConclusionDetail?
)

// ✅ BARU v4.0: Detail kesimpulan binary
data class ConclusionDetail(
    val is_fiktif: Boolean,
    val total_checked: Int,
    val total_fiktif: Int,
    val total_asli: Int,
    val fiktif_documents: List<String>,   // ["KTP", "MUTASI"]
    val asli_documents: List<String>,     // ["NPWP", "PBB", "SLIPGAJI", "LISTRIK"]
    val explanation: String               // Penjelasan detail
)

data class BreakdownItem(
    val component: String,              // "KTP", "TEMPAT_TINGGAL", dll
    val category: String,               // "DOCUMENT" atau "PROOF" 
    val similarity_percentage: Double,   // 0-100 (tingkat kemiripan keseluruhan)
    val matched_fields: List<MatchedField>?,   // Detail field yang cocok (DOCUMENT)
    val comparison_summary: String?,     // Ringkasan AI
    val fraud_patterns: List<String>?,   // Pola fraud terdeteksi AI
    val top_similar_matches: List<SimilarMatch>?,  // Top 3 sumber (PROOF)
    val visual_analysis: String?,        // Analisis AI visual (PROOF)
    val note: String?
)

data class MatchedField(
    val field: String,            // "Nomor Induk Kependudukan (NIK)"
    val field_key: String,        // "NIK"
    val value_preview: String,    // "3201****0123" (masked)
    val is_match: Boolean,
    val similarity_percentage: Double,  // 0-100 per-field similarity
    val detail: String?           // "NIK identik dengan dokumen di database"
)

// Untuk PROOF — top 3 visual matches dari internet
data class SimilarMatch(
    val rank: Int,
    val source: String,                   // "rumah123.com"
    val title: String,                    // "Rumah Dijual di Bandung"
    val link: String?,
    val similarity_percentage: Double,    // 0-100 (kemiripan visual)
    val similarity_description: String    // "Bentuk bangunan, fasad rumah, dan tata letak identik"
)

data class RiskLevel(
    val level: String,           // "LOW_RISK", "CRITICAL_RISK", dll
    val color: String,           // "🟢", "🔴", dll
    val label: String,
    val description: String,
    val action_required: String
)
```

Pastikan Anda menangkap HTTP Status Code (Response `200` berarti Success, `400`/`401`/`500` berarti Error exception) dan mengecek parameter `"success"` yang menjadi standar format API Anda.

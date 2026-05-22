# Hướng dẫn GenRights — Deploy, chạy UI & đẩy lên Git

Tài liệu này dành cho developer clone repo, chạy local, deploy contract trên GenLayer Studio, và **push lên GitHub/GitLab**.

**Tác giả / Author:** Hoa Tran Rom  
- X: [https://x.com/HoaTranRom](https://x.com/HoaTranRom)  
- GitHub: [https://github.com/hoasine](https://github.com/hoasine)

---

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Chuẩn bị môi trường](#2-chuẩn-bị-môi-trường)
3. [Cấu hình frontend](#3-cấu-hình-frontend)
4. [Deploy Intelligent Contract](#4-deploy-intelligent-contract)
5. [Chạy giao diện web](#5-chạy-giao-diện-web)
6. [Sử dụng dApp](#6-sử-dụng-dapp)
7. [Test contract (tùy chọn)](#7-test-contract-tùy-chọn)
8. [Đẩy code lên Git](#8-đẩy-code-lên-git)
9. [Xử lý lỗi thường gặp](#9-xử-lý-lỗi-thường-gặp)

---

## 1. Giới thiệu

**GenRights** giải quyết bài toán: làm sao smart contract **tự đọc nội dung web** và **đưa ra quyết định chủ quan** (có vi phạm bản quyền không) mà không cần luật sư trung gian cho từng case nhỏ.

Luồng chính:

```
Rights Holder                    Bounty Hunter
      │                                │
      ├─ register_work (URL gốc)       │
      ├─ fund_bounty (GEN)             │
      │                                ├─ report_infringement (URL nghi phạm)
      │                                │
      └──────── AI Jury on-chain ──────┘
                    │
            CONFIRMED → trả % bounty pool
            REJECTED  → không trả
```

Công nghệ:

- **Contract:** Python / GenLayer (`contracts/genrights.py`)
- **Frontend:** Next.js 16 + genlayer-js + MetaMask
- **Mạng dev:** Studionet (`studio.genlayer.com`)

---

## 2. Chuẩn bị môi trường

### Bắt buộc

| Công cụ | Phiên bản | Link |
|---------|-----------|------|
| Node.js | 18+ | https://nodejs.org |
| npm | đi kèm Node | |
| MetaMask | mới nhất | https://metamask.io |
| Git | bất kỳ | https://git-scm.com |

### Tùy chọn (contract dev)

| Công cụ | Mục đích |
|---------|----------|
| Python 3.12+ | `pytest`, `genvm-lint` |
| GenLayer CLI | `npm install -g genlayer` — deploy từ terminal |

### Ví & token test

1. Mở https://studio.genlayer.com
2. Connect MetaMask
3. Thêm mạng **GenLayer Studionet** (nếu chưa có):

| Trường | Giá trị |
|--------|---------|
| Network name | GenLayer Studionet |
| RPC URL | `https://studio.genlayer.com/api` |
| Chain ID | `61999` |
| Symbol | `GEN` |

4. Bấm **💧 Faucet** trong Studio để nhận GEN test

---

## 3. Cấu hình frontend

### Bước 1 — Copy file môi trường

```powershell
cd frontend
copy .env.example .env
```

Trên macOS/Linux:

```bash
cd frontend
cp .env.example .env
```

### Bước 2 — Điền biến môi trường

Mở `frontend/.env`:

```env
# Địa chỉ contract sau khi deploy (42 ký tự, bắt đầu 0x)
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddressHere

NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_CHAIN_ID=61999
NEXT_PUBLIC_GENLAYER_CHAIN_NAME=GenLayer Studionet
NEXT_PUBLIC_GENLAYER_SYMBOL=GEN
```

**Quan trọng:**

- Không commit file `.env` lên Git (đã có trong `.gitignore`)
- Chỉ commit `.env.example` (không có địa chỉ thật / private key)

---

## 4. Deploy Intelligent Contract

### Cách A — GenLayer Studio (khuyến nghị cho người mới)

1. Đăng nhập https://studio.genlayer.com + Connect ví
2. **Contracts** → tạo file mới
3. Copy **toàn bộ** `contracts/genrights.py` vào editor
4. Kiểm tra dòng đầu file:

```python
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
```

5. **Deploy** — constructor **không có tham số** (`__init__` rỗng)
6. Chờ trạng thái **ACCEPTED** / **FINALIZED**
7. Copy **Contract address** → dán vào `frontend/.env`

#### Lỗi deploy `TreeMap()` trong `__init__`

Contract **không được** gán `self.works = TreeMap()` trong `__init__`. Storage GenLayer zero-init sẵn. File trong repo đã sửa — chỉ set `default_min_confidence` và `bounty_reward_percent`.

### Cách B — GenLayer CLI

```powershell
cd genrights
npm install -g genlayer
genlayer network
# Chọn: studionet

npm run deploy
```

Script deploy: `deploy/deployScript.ts` → `contracts/genrights.py`

---

## 5. Chạy giao diện web

```powershell
cd frontend
npm install
npm run dev
```

| URL | Mô tả |
|-----|--------|
| http://localhost:3000 | Trang chính GenRights |

Build production:

```powershell
npm run build
npm run start
```

---

## 6. Sử dụng dApp

### Kết nối ví

Góc phải → **Kết nối ví** → MetaMask → approve → đảm bảo mạng **Studionet**.

### Tab Đăng ký (`register_work`)

| Trường | Ví dụ |
|--------|--------|
| Tiêu đề | `Bài blog của tôi` |
| Loại | `article` |
| URL gốc | Mỗi dòng một URL public |
| License | Mô tả quyền sử dụng |

Transaction có thể **2–10 phút** (AI đọc web).

### Tab Bounty (`fund_bounty`)

- Chọn `work_id`
- Nhập số GEN (ví dụ `1`)
- **Chỉ ví đã đăng ký** tác phẩm mới fund được

### Tab Báo cáo (`report_infringement`)

- Chọn `work_id` (pool phải > 0)
- URL trang nghi copy
- AI trả `CONFIRMED` / `REJECTED` / `INCONCLUSIVE`

### Tab Registry

- Danh sách tác phẩm on-chain
- Chi tiết: fingerprint, bounty, lịch sử báo cáo

---

## 7. Test contract (tùy chọn)

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
pytest tests/direct/test_genrights.py -v
```

Cần `genlayer-test` tải được GenVM artifacts. Nếu lỗi HTTP 404 khi download GenVM, bỏ qua pytest và test trực tiếp trên Studio.

Lint contract:

```powershell
genvm-lint check contracts/genrights.py
```

---

## 8. Đẩy code lên Git

### 8.1. File KHÔNG được push

Đã cấu hình trong `.gitignore`:

| Loại | Ví dụ |
|------|--------|
| Secrets | `frontend/.env`, mọi file `.env` có key thật |
| Dependencies | `node_modules/`, `frontend/node_modules/` |
| Build | `frontend/.next/` |
| Python | `.venv/`, `__pycache__/` |
| GenLayer artifacts | `artifacts/` |

**Kiểm tra trước khi commit:**

```powershell
git status
```

Không thấy `.env`, `node_modules`, `.next`.

### 8.2. Khởi tạo repo lần đầu (chưa có Git)

```powershell
cd C:\Users\Rom IT\Project\genrights

git init
git add .
git status
git commit -m "feat: GenRights dApp - AI copyright licensing on GenLayer"
```

### 8.3. Tạo repo trên GitHub

1. GitHub → **New repository**
2. Tên ví dụ: `genrights`
3. **Không** tick "Add README" nếu local đã có README
4. Copy URL: `https://github.com/<username>/genrights.git`

### 8.4. Push lên GitHub

```powershell
git branch -M main
git remote add origin https://github.com/<USERNAME>/genrights.git
git push -u origin main
```

Dùng SSH:

```powershell
git remote add origin git@github.com:<USERNAME>/genrights.git
git push -u origin main
```

### 8.5. Commit các thay đổi sau này

```powershell
git add .
git commit -m "mô tả thay đổi ngắn gọn"
git push
```

### 8.6. Gợi ý message commit

| Thay đổi | Message mẫu |
|----------|-------------|
| Contract mới | `feat(contract): add GenRights intelligent contract` |
| UI | `feat(frontend): GenRights dashboard with registry` |
| Docs | `docs: add Vietnamese setup guide` |
| Fix deploy | `fix(contract): remove TreeMap init in __init__` |

### 8.7. Clone repo (cho người khác)

```bash
git clone https://github.com/<USERNAME>/genrights.git
cd genrights/frontend
cp .env.example .env
# Điền NEXT_PUBLIC_CONTRACT_ADDRESS
npm install
npm run dev
```

Họ cần **deploy contract riêng** hoặc dùng chung địa chỉ contract bạn chia sẻ (chỉ đọc/ghi on-chain chung).

---

## 9. Xử lý lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách xử lý |
|-------------|-------------|------------|
| UI "Chưa cấu hình contract" | Thiếu/ sai `.env` | Điền `NEXT_PUBLIC_CONTRACT_ADDRESS`, restart `npm run dev` |
| Deploy ERROR tại `TreeMap()` | Gán TreeMap trong `__init__` | Dùng `genrights.py` từ repo (đã fix) |
| `bounty pool is empty` | Chưa `fund_bounty` | Fund + gửi Value GEN |
| `only rights holder can fund` | Sai ví | Dùng ví đã `register_work` |
| MetaMask không connect | Nhiều extension ví | Chỉ bật MetaMask |
| Transaction pending lâu | AI validators | Đợi; xem Studio Logs |
| `register_work` fail | URL login-wall | Dùng URL public (blog, raw GitHub, v.v.) |
| `git push` rejected | Chưa có quyền / sai remote | Kiểm tra `git remote -v`, đăng nhập GitHub |

---

## Liên hệ & tài liệu tham khảo

- GenLayer: https://docs.genlayer.com/
- Studio: https://studio.genlayer.com/
- Networks: https://docs.genlayer.com/developers/networks

---

*Cập nhật: GenRights MVP — Studionet + Studio deploy*

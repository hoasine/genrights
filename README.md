# GenRights

**Licensing nội dung & phát hiện vi phạm bản quyền có thưởng** — dApp trên [GenLayer](https://www.genlayer.com/) sử dụng Intelligent Contract (Python).

**Tác giả:** Hoa Tran Rom ([@hoasine](https://github.com/hoasine))  
- X: [https://x.com/HoaTranRom](https://x.com/HoaTranRom)  
- GitHub: [https://github.com/hoasine](https://github.com/hoasine)

Contract tự **đọc web** (`gl.nondet.web.render`) và **phán quyết bằng AI** (`gl.nondet.exec_prompt`) on-chain — việc mà Solidity/Ethereum không làm được mà không cần oracle/trọng tài off-chain.

---

## Tính năng

| Hàm contract | Mô tả |
|--------------|--------|
| `register_work` | Đăng ký tác phẩm + AI tạo fingerprint từ URL gốc |
| `fund_bounty` | Rights holder nạp GEN vào bounty pool (payable) |
| `report_infringement` | Bounty hunter báo URL nghi phạm → AI jury → trả thưởng |
| `get_work` / `get_report` | Đọc trạng thái on-chain |

**Frontend:** Next.js 16, MetaMask, GenLayer Studionet — 5 tab (Tổng quan, Đăng ký, Bounty, Báo cáo, Registry).

---

## Yêu cầu

- [Node.js](https://nodejs.org/) 18+
- [Python](https://www.python.org/) 3.12+ (test/lint contract)
- [MetaMask](https://metamask.io/)
- Tài khoản trên [GenLayer Studio](https://studio.genlayer.com/) + GEN test (faucet 💧)

---

## Quick Start

### 1. Clone & cài đặt

```bash
git clone <URL_REPO_CUA_BAN>
cd genrights

# Frontend
cd frontend
cp .env.example .env
# Sửa NEXT_PUBLIC_CONTRACT_ADDRESS trong .env
npm install
npm run dev
```

Mở http://localhost:3000

### 2. Deploy contract (Studio — khuyến nghị)

1. Vào https://studio.genlayer.com → Connect MetaMask (Studionet)
2. Tạo contract mới → paste nội dung `contracts/genrights.py`
3. Deploy → copy địa chỉ `0x...`
4. Dán vào `frontend/.env`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
```

Chi tiết: [docs/HUONG_DAN.md](./docs/HUONG_DAN.md)

---

## Cấu trúc dự án

```
genrights/
├── contracts/
│   └── genrights.py          # Intelligent Contract chính
├── tests/direct/
│   └── test_genrights.py     # Test mock web/LLM
├── deploy/
│   └── deployScript.ts       # Deploy qua GenLayer CLI
├── frontend/                 # Next.js dApp
│   ├── app/
│   ├── components/genrights/
│   ├── lib/contracts/
│   └── .env.example
├── docs/
│   └── HUONG_DAN.md          # Hướng dẫn đầy đủ (VN)
├── gltest.config.yaml
└── requirements.txt
```

---

## Scripts

| Lệnh | Mô tả |
|------|--------|
| `cd frontend && npm run dev` | Chạy UI local |
| `cd frontend && npm run build` | Build production |
| `npm run deploy` | Deploy contract (cần GenLayer CLI) |
| `pytest tests/direct/test_genrights.py -v` | Test contract (cần genlayer-test) |

---

## Mạng GenLayer

| Mạng | RPC | Chain ID |
|------|-----|----------|
| **Studionet** (mặc định UI) | `https://studio.genlayer.com/api` | 61999 |

---

## Deploy online (Vercel)

1. Import repo [hoasine/genrights](https://github.com/hoasine/genrights) trên [Vercel](https://vercel.com/)
2. **Root Directory:** `frontend`
3. Thêm biến môi trường `NEXT_PUBLIC_*` (xem [docs/VERCEL.md](./docs/VERCEL.md))

## Tài liệu

- [Hướng dẫn chi tiết (Tiếng Việt)](./docs/HUONG_DAN.md) — deploy, UI, Git, troubleshooting
- [Deploy Vercel](./docs/VERCEL.md)
- [Checklist push Git](./docs/GIT_PUSH.md)
- [GenLayer Docs](https://docs.genlayer.com/)

## Liên hệ / Author

| | |
|---|---|
| **X** | [https://x.com/HoaTranRom](https://x.com/HoaTranRom) |
| **GitHub** | [https://github.com/hoasine](https://github.com/hoasine) |

---

## Lưu ý pháp lý

GenRights là **hợp đồng tư nhân + rubric AI on-chain**, không thay thế tòa án hay cơ quan bản quyền.

---

## License

MIT (xem [LICENSE](./LICENSE))

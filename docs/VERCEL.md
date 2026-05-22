# Deploy GenRights lên Vercel

Hướng dẫn đưa frontend Next.js lên [Vercel](https://vercel.com/) (miễn phí cho hobby).

Repo GitHub: [https://github.com/hoasine/genrights](https://github.com/hoasine/genrights)

---

## Cách 1 — Import từ GitHub (khuyến nghị)

1. Đăng nhập [vercel.com](https://vercel.com/) → **Add New…** → **Project**
2. Import repo **hoasine/genrights**
3. **Root Directory** → bấm **Edit** → chọn **`frontend`**
4. Framework: **Next.js** (tự nhận)
5. **Environment Variables** — thêm từng biến (Production + Preview):

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `0xf3c87B03163b3f802B75D1aEaa64FbaE2Db2Ba68` |
| `NEXT_PUBLIC_GENLAYER_RPC_URL` | `https://studio.genlayer.com/api` |
| `NEXT_PUBLIC_GENLAYER_CHAIN_ID` | `61999` |
| `NEXT_PUBLIC_GENLAYER_CHAIN_NAME` | `GenLayer Studionet` |
| `NEXT_PUBLIC_GENLAYER_SYMBOL` | `GEN` |

6. **Deploy**

Sau vài phút bạn có URL dạng `https://genrights-xxx.vercel.app`.

---

## Cách 2 — Vercel CLI

```powershell
cd "C:\Users\Rom IT\Project\genrights\frontend"
npx vercel login
npx vercel link
npx vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS
# (nhập contract address khi được hỏi)
npx vercel --prod
```

---

## Lưu ý

- **MetaMask** vẫn chạy trên trình duyệt người dùng; site Vercel chỉ host UI.
- Contract address đổi sau deploy mới → cập nhật env trên Vercel → **Redeploy**.
- Không commit `frontend/.env` (đã có trong `.gitignore`).

---

## Author

- X: [https://x.com/HoaTranRom](https://x.com/HoaTranRom)
- GitHub: [https://github.com/hoasine](https://github.com/hoasine)

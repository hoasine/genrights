# Checklist push Git — GenRights

Tài liệu ngắn, copy-paste nhanh khi đẩy repo lên GitHub.

**Author:** [Hoa Tran Rom](https://x.com/HoaTranRom) · GitHub: [hoasine](https://github.com/hoasine)

---

## Trước khi push

```powershell
cd "C:\Users\Rom IT\Project\genrights"

# Đảm bảo KHÔNG add file nhạy cảm
git status
```

Phải **không** thấy:

- `frontend/.env`
- `node_modules/`
- `frontend/.next/`
- `.venv/`

Nếu `.env` đã lỡ `git add`:

```powershell
git reset HEAD frontend/.env
```

---

## Bước 0 — Tạo repo trên GitHub (bắt buộc, một lần)

1. Đăng nhập https://github.com/hoasine
2. **New repository** → tên: `genrights`
3. **Public**, **không** tick README / .gitignore (local đã có)
4. **Create repository**

## Lần đầu push

Commit đã tạo sẵn: `dcbb57f feat: GenRights dApp...`

```powershell
cd "C:\Users\Rom IT\Project\genrights"
git push -u origin main
```

Hoặc nếu chưa init (repo mới hoàn toàn):

```powershell
git init
git add .
git commit -m "feat: GenRights - AI copyright licensing on GenLayer"

git branch -M main
git remote add origin https://github.com/hoasine/genrights.git
git push -u origin main
```

> Repo đã cấu hình remote: `https://github.com/hoasine/genrights.git`  
> Tạo repo trống trên GitHub trước khi push (xem bước 0 bên dưới).

---

## Cập nhật sau này

```powershell
git add .
git commit -m "docs: update guide / fix: ..."
git push
```

---

## File nên có trên repo

| File | Mục đích |
|------|----------|
| `README.md` | Giới thiệu + quick start |
| `docs/HUONG_DAN.md` | Hướng dẫn đầy đủ tiếng Việt |
| `docs/GIT_PUSH.md` | Checklist Git |
| `frontend/.env.example` | Mẫu cấu hình (không có secret) |
| `contracts/genrights.py` | Intelligent Contract |
| `.gitignore` | Loại trừ secret & build |

---

## Không push

- `frontend/.env` — có địa chỉ contract deploy (có thể public nhưng tốt nhất mỗi người tự deploy)
- Private keys / seed phrase — **không bao giờ**

---

Xem hướng dẫn đầy đủ: [HUONG_DAN.md](./HUONG_DAN.md)

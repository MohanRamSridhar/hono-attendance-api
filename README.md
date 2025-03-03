# 📌 Hono-Based Attendance API

A simple **Hono**-based Node.js API for class management, student attendance tracking, and CSV-based user import.

## 🚀 Features
- ✅ **Create Classes**
- ✅ **Import Students via CSV**
- ✅ **Mark Attendance**
- ✅ **Fetch Present & Absent Students**
- ✅ **Lightweight SQLite Database**

---

## 📥 Installation & Setup

### 1️⃣ Prerequisites
Ensure you have **Node.js** installed. Check with:
```sh
node -v
```
If not installed, download it from [Node.js official website](https://nodejs.org/).

### 2️⃣ Clone & Setup the Project
```sh
git clone https://github.com/MohanRamSridhar/hono-attendance-api.git
cd hono-attendance-api
npm install
```

### 3️⃣ Run the Server
```sh
npm start  # For production
npm run dev  # For development (with live reload)
```

The server will start at: `http://localhost:3000`

---

## 📌 API Endpoints

### ✅ Create a Class
**POST** `/api/classes`
```json
{
  "class_name": "CS101"
}
```
**Response:**
```json
{
  "message": "Class created",
  "class_id": 1
}
```

---

### ✅ Import Students via CSV
**POST** `/api/classes/{class_id}/import`
- Upload a CSV file with:
```
unique_number,name
12345,John Doe
67890,Jane Smith
```
**Response:**
```json
{
  "message": "Users imported",
  "total_users": 30
}
```

---

### ✅ Mark Attendance
**POST** `/api/classes/{class_id}/attendance`
```json
{
  "unique_number": "12345"
}
```
**Response:** (If user exists)
```json
{
  "message": "Attendance updated",
  "unique_number": "12345",
  "status": "Present"
}
```

**Response:** (If user not found)
```json
{
  "message": "User not found",
  "unique_number": "12345"
}
```

---

### ✅ Fetch Present Students
**GET** `/api/classes/{class_id}/present`
```json
{
  "class_id": 1,
  "date": "2025-02-11",
  "present_students": [
    { "unique_number": "12345", "name": "John Doe" },
    { "unique_number": "67890", "name": "Jane Smith" }
  ]
}
```

---

### ✅ Fetch Absent Students
**GET** `/api/classes/{class_id}/absent`
```json
{
  "class_id": 1,
  "date": "2025-02-11",
  "absent_students": [
    { "unique_number": "54321", "name": "Alice Brown" },
    { "unique_number": "98765", "name": "Bob Wilson" }
  ]
}
```

---

## 📡 Deployment
### Deploy using **Railway, Vercel, or Render**
Example (Railway):
```sh
railway init
railway up
```

---

## 🎯 Next Steps
- Add **authentication (JWT)**
- Use **PostgreSQL** instead of SQLite for scalability
- Implement **frontend UI**

---

💡 **Contributions are welcome!** Fork, make changes, and submit a PR 🚀


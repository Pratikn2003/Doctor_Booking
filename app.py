from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import hashlib
import os
import random
import json
import urllib.request
import urllib.error
from datetime import datetime

app = FastAPI()

CACHE_DIR = "database"
DISTRICT_CACHE_FILE = os.path.join(CACHE_DIR, "india_districts_cache.json")
DISTRICT_CACHE = {
    "districts": None,
    "updated_at": None,
}

FALLBACK_DISTRICTS = sorted(
    {
        "Varanasi",
        "Lucknow",
        "Prayagraj",
        "Kanpur Dehat",
        "Gorakhpur",
        "Jaunpur",
        "Azamgarh",
        "Ballia",
        "Basti",
    }
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB
def get_db():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn

# INIT DB
def init_db():
    conn = get_db()
    c = conn.cursor()

    c.execute("""CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        age INTEGER,
        village TEXT,
        password TEXT
    )""")

    c.execute("""CREATE TABLE IF NOT EXISTS doctors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        specialization TEXT,
        location TEXT,
        contact_number TEXT,
        fees REAL,
        seat_capacity INTEGER
    )""")

    # Keep old databases compatible by adding newly required doctor fields.
    ensure_doctors_schema(c)

    c.execute("""CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        doctor_id INTEGER,
        booking_date TEXT,
        token_number INTEGER,
        fees REAL,
        status TEXT
    )""")

    conn.commit()
    conn.close()


def ensure_doctors_schema(cursor):
    cursor.execute("PRAGMA table_info(doctors)")
    existing_columns = {row[1] for row in cursor.fetchall()}

    required_columns = {
        "district": "TEXT DEFAULT 'Unknown District'",
        "available_days": "TEXT DEFAULT 'Monday,Wednesday,Friday'",
        "start_time": "TEXT DEFAULT '09:00'",
        "end_time": "TEXT DEFAULT '17:00'",
        "experience": "INTEGER DEFAULT 5",
        "qualification": "TEXT DEFAULT 'MBBS'",
        "rating": "REAL DEFAULT 4.5",
        "is_active": "INTEGER DEFAULT 1",
    }

    for column_name, definition in required_columns.items():
        if column_name not in existing_columns:
            cursor.execute(f"ALTER TABLE doctors ADD COLUMN {column_name} {definition}")

    # Backfill district for existing rows where village is known.
    village_district_pairs = [
        ("Rampur Village", "Varanasi"),
        ("Shivpur Village", "Lucknow"),
        ("Lakshmipur Village", "Prayagraj"),
        ("Ganeshpur Village", "Kanpur Dehat"),
        ("Krishnapur Village", "Gorakhpur"),
        ("Suryapur Village", "Jaunpur"),
        ("Nandgaon Village", "Azamgarh"),
        ("Haripur Village", "Ballia"),
        ("Ranjitpur Village", "Basti"),
    ]
    for village, district in village_district_pairs:
        cursor.execute(
            """
            UPDATE doctors
            SET district = ?
            WHERE location = ? AND (district IS NULL OR district = '' OR district = 'Unknown District')
            """,
            (district, village),
        )

# MODELS
class UserRegister(BaseModel):
    name: str
    email: str
    phone: str
    age: int
    village: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Booking(BaseModel):
    user_id: int
    doctor_id: int
    booking_date: str
    token_number: int
    fees: float
    status: str


class DoctorCreate(BaseModel):
    name: str
    specialization: str
    location: str
    district: str
    contact_number: str
    fees: float
    seat_capacity: int
    available_days: str
    start_time: str
    end_time: str
    experience: int
    qualification: str
    rating: float = 4.5
    is_active: bool = True

# STARTUP
@app.on_event("startup")
def startup():
    init_db()
    seed_doctors()

# SAMPLE DOCTORS
def seed_doctors():
    conn = get_db()
    c = conn.cursor()

    c.execute("SELECT COUNT(*) FROM doctors")
    existing_count = c.fetchone()[0]
    target_count = 12

    if existing_count >= target_count:
        conn.close()
        return

    doctors_to_add = target_count - existing_count
    for _ in range(doctors_to_add):
        d = generate_random_doctor()
        c.execute(
            """
            INSERT INTO doctors (
                name, specialization, location, district, contact_number, fees, seat_capacity,
                available_days, start_time, end_time, experience, qualification, rating, is_active
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            d,
        )

    conn.commit()
    conn.close()


def generate_random_doctor():
    first_names = [
        "Rajesh", "Priya", "Anamika", "Sunil", "Meera", "Vikram", "Kavita", "Suresh",
        "Anita", "Ramesh", "Pooja", "Deepak", "Neha", "Arun", "Sneha", "Mohan",
    ]
    last_names = [
        "Kumar", "Sharma", "Singh", "Verma", "Devi", "Patel", "Rao", "Yadav",
        "Prasad", "Mishra", "Gupta", "Nair", "Joshi", "Das", "Roy", "Pandey",
    ]
    village_district_pairs = [
        ("Rampur Village", "Varanasi"),
        ("Shivpur Village", "Lucknow"),
        ("Lakshmipur Village", "Prayagraj"),
        ("Ganeshpur Village", "Kanpur Dehat"),
        ("Krishnapur Village", "Gorakhpur"),
        ("Suryapur Village", "Jaunpur"),
        ("Nandgaon Village", "Azamgarh"),
        ("Haripur Village", "Ballia"),
    ]
    specialization_data = [
        ("General Physician", "MBBS", 120, 220),
        ("Pediatrician", "MBBS, MD (Pediatrics)", 180, 300),
        ("Gynecologist", "MBBS, MS (Gynecology)", 250, 450),
        ("Dentist", "BDS, MDS", 150, 350),
        ("Cardiologist", "MBBS, DM (Cardiology)", 350, 700),
        ("Dermatologist", "MBBS, MD (Dermatology)", 250, 500),
        ("Orthopedic", "MBBS, MS (Orthopedics)", 300, 550),
        ("Ayurveda", "BAMS, MD (Ayurveda)", 80, 220),
    ]
    day_patterns = [
        "Monday,Wednesday,Friday",
        "Tuesday,Thursday,Saturday",
        "Monday,Tuesday,Thursday",
        "Wednesday,Friday,Saturday",
        "Monday,Tuesday,Wednesday,Thursday,Friday",
    ]
    time_slots = [
        ("08:00", "14:00"),
        ("09:00", "17:00"),
        ("10:00", "18:00"),
        ("11:00", "19:00"),
        ("14:00", "20:00"),
    ]

    first = random.choice(first_names)
    last = random.choice(last_names)
    name = f"Dr. {first} {last}"
    specialization, qualification, fee_min, fee_max = random.choice(specialization_data)
    location, district = random.choice(village_district_pairs)
    contact_number = f"9{random.randint(10**8, 10**9 - 1)}"
    fees = float(random.randrange(fee_min, fee_max + 10, 10))
    seat_capacity = random.randint(8, 30)
    available_days = random.choice(day_patterns)
    start_time, end_time = random.choice(time_slots)
    experience = random.randint(2, 25)
    rating = round(random.uniform(4.1, 5.0), 1)
    is_active = 1

    return (
        name,
        specialization,
        location,
        district,
        contact_number,
        fees,
        seat_capacity,
        available_days,
        start_time,
        end_time,
        experience,
        qualification,
        rating,
        is_active,
    )


def add_random_doctors(count: int):
    conn = get_db()
    c = conn.cursor()

    for _ in range(count):
        d = generate_random_doctor()
        c.execute(
            """
            INSERT INTO doctors (
                name, specialization, location, district, contact_number, fees, seat_capacity,
                available_days, start_time, end_time, experience, qualification, rating, is_active
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            d,
        )

    conn.commit()
    conn.close()


def _fetch_json(url: str, timeout: int = 10):
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))


def fetch_all_india_districts():
    states_response = _fetch_json("https://cdn-api.co-vin.in/api/v2/admin/location/states")
    states = states_response.get("states", [])
    districts = set()

    for state in states:
        state_id = state.get("state_id")
        if not state_id:
            continue

        district_response = _fetch_json(
            f"https://cdn-api.co-vin.in/api/v2/admin/location/districts/{state_id}"
        )
        for district in district_response.get("districts", []):
            name = district.get("district_name", "").strip()
            if name:
                districts.add(name)

    return sorted(districts)


def load_cached_districts():
    if not os.path.exists(DISTRICT_CACHE_FILE):
        return None

    try:
        with open(DISTRICT_CACHE_FILE, "r", encoding="utf-8") as f:
            payload = json.load(f)

        districts = payload.get("districts", [])
        updated_at = payload.get("updated_at")
        if isinstance(districts, list) and districts:
            DISTRICT_CACHE["districts"] = sorted(set(districts))
            DISTRICT_CACHE["updated_at"] = updated_at
            return DISTRICT_CACHE["districts"]
    except Exception:
        return None

    return None


def save_district_cache(districts):
    os.makedirs(CACHE_DIR, exist_ok=True)
    payload = {
        "updated_at": datetime.utcnow().isoformat(),
        "districts": districts,
    }

    with open(DISTRICT_CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=True)


def fallback_districts_from_db():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT DISTINCT district FROM doctors WHERE district IS NOT NULL AND district <> ''")
    db_districts = {row[0] for row in c.fetchall() if row[0]}
    conn.close()
    return sorted(set(FALLBACK_DISTRICTS).union(db_districts))

# ROOT
@app.get("/")
def home():
    return {"message": "API Running"}

# REGISTER
@app.post("/api/auth/register")
def register(user: UserRegister):
    conn = get_db()
    c = conn.cursor()

    hashed = hashlib.sha256(user.password.encode()).hexdigest()

    c.execute("SELECT * FROM users WHERE email=?", (user.email,))
    if c.fetchone():
        conn.close()
        raise HTTPException(400, "Email exists")

    c.execute(
        "INSERT INTO users (name,email,phone,age,village,password) VALUES (?,?,?,?,?,?)",
        (user.name, user.email, user.phone, user.age, user.village, hashed)
    )

    conn.commit()
    conn.close()

    return {"message": "Registered successfully"}

# LOGIN
@app.post("/api/auth/login")
def login(user: UserLogin):
    conn = get_db()
    c = conn.cursor()

    hashed = hashlib.sha256(user.password.encode()).hexdigest()

    c.execute("SELECT * FROM users WHERE email=? AND password=?", (user.email, hashed))
    row = c.fetchone()
    conn.close()

    if not row:
        raise HTTPException(401, "Invalid credentials")

    return {"message": "Login success", "user": dict(row)}

# GET DOCTORS
@app.get("/api/doctors")
def get_doctors():
    conn = get_db()
    c = conn.cursor()

    c.execute("SELECT * FROM doctors")
    data = [dict(row) for row in c.fetchall()]

    conn.close()
    return {"doctors": data}


@app.post("/api/doctors")
def create_doctor(doctor: DoctorCreate):
    conn = get_db()
    c = conn.cursor()

    c.execute(
        """
        INSERT INTO doctors (
            name, specialization, location, district, contact_number, fees, seat_capacity,
            available_days, start_time, end_time, experience, qualification, rating, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            doctor.name,
            doctor.specialization,
            doctor.location,
            doctor.district,
            doctor.contact_number,
            doctor.fees,
            doctor.seat_capacity,
            doctor.available_days,
            doctor.start_time,
            doctor.end_time,
            doctor.experience,
            doctor.qualification,
            doctor.rating,
            1 if doctor.is_active else 0,
        ),
    )

    conn.commit()
    doctor_id = c.lastrowid
    conn.close()

    return {"message": "Doctor added successfully", "doctor_id": doctor_id}


@app.post("/api/doctors/seed-random")
def seed_random_doctors(count: int = 10):
    if count < 1 or count > 100:
        raise HTTPException(400, "count must be between 1 and 100")

    add_random_doctors(count)
    return {"message": f"{count} random doctors added successfully"}


@app.get("/api/locations/districts")
def get_all_districts():
    # First serve in-memory cache when available.
    if DISTRICT_CACHE["districts"]:
        return {
            "districts": DISTRICT_CACHE["districts"],
            "source": "memory-cache",
            "updated_at": DISTRICT_CACHE["updated_at"],
        }

    # Then try file cache to avoid repeated network calls.
    cached = load_cached_districts()
    if cached:
        return {
            "districts": cached,
            "source": "file-cache",
            "updated_at": DISTRICT_CACHE["updated_at"],
        }

    # Try live district fetch from CoWIN public admin APIs.
    try:
        districts = fetch_all_india_districts()
        if districts:
            DISTRICT_CACHE["districts"] = districts
            DISTRICT_CACHE["updated_at"] = datetime.utcnow().isoformat()
            save_district_cache(districts)
            return {
                "districts": districts,
                "source": "cowin",
                "updated_at": DISTRICT_CACHE["updated_at"],
            }
    except (urllib.error.URLError, TimeoutError, ValueError, json.JSONDecodeError):
        pass

    # Final fallback: districts from current DB + seeded villages.
    fallback = fallback_districts_from_db()
    DISTRICT_CACHE["districts"] = fallback
    DISTRICT_CACHE["updated_at"] = datetime.utcnow().isoformat()
    return {
        "districts": fallback,
        "source": "fallback",
        "updated_at": DISTRICT_CACHE["updated_at"],
    }

# BOOK APPOINTMENT
@app.post("/api/bookings")
def book(b: Booking):
    conn = get_db()
    c = conn.cursor()

    c.execute(
        "SELECT COUNT(*) FROM bookings WHERE doctor_id=? AND booking_date=?",
        (b.doctor_id, b.booking_date)
    )
    count = c.fetchone()[0]

    c.execute("SELECT seat_capacity FROM doctors WHERE id=?", (b.doctor_id,))
    cap = c.fetchone()

    if not cap:
        raise HTTPException(404, "Doctor not found")

    if count >= cap[0]:
        raise HTTPException(400, "No seats available")

    c.execute(
        "INSERT INTO bookings (user_id,doctor_id,booking_date,token_number,fees,status) VALUES (?,?,?,?,?,?)",
        (b.user_id, b.doctor_id, b.booking_date, b.token_number, b.fees, b.status)
    )

    conn.commit()
    conn.close()

    return {"message": "Booked successfully"}

# GET BOOKINGS
@app.get("/api/bookings/{user_id}")
def get_bookings(user_id: int):
    conn = get_db()
    c = conn.cursor()

    c.execute("SELECT * FROM bookings WHERE user_id=?", (user_id,))
    data = [dict(row) for row in c.fetchall()]

    conn.close()
    return {"bookings": data}

# RUN
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
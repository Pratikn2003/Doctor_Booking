# Gramin Healthcare - Doctor Finding System

A comprehensive healthcare platform designed to help rural and village communities find doctors, book appointments, and get AI-powered medical recommendations.

## 🏥 Features

- **User Registration & Authentication**: Sign up and login system with secure password hashing
- **Doctor Search**: Find doctors by specialization and location
- **AI Recommendations**: ML-based symptom analysis to recommend the right specialist
- **Appointment Booking**: Book appointments with real-time seat availability
- **Token System**: Instant token number generation upon booking
- **My Bookings**: View and manage all appointments
- **Unique UI**: Modern glassmorphism design with vibrant gradients

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with unique glassmorphism effects
- **JavaScript** - Interactive functionality

### Backend
- **Python** - Primary language
- **FastAPI** - Web framework for REST API
- **MySQL** - Database management

### Machine Learning
- **Scikit-learn** - ML library for doctor recommendations
- **TF-IDF Vectorizer** - Symptom text analysis
- **Cosine Similarity** - matching algorithm

## 📁 Project Structure

```
gramin-healthcare/
├── index.html              # Frontend HTML
├── styles.css              # Unique styling with glassmorphism
├── script.js                # Frontend JavaScript logic
├── app.py                   # FastAPI backend
├── ml_model.py             # ML recommendation model
├── database_schema.sql     # MySQL database schema
├── requirements.txt        # Python dependencies
└── README.md              # Documentation
```

## 🚀 Setup & Installation

### Prerequisites
- Python 3.8 or higher
- MySQL Server
- Modern web browser

### 1. Database Setup

```bash
# Start MySQL server
sudo service mysql start  # Linux
# or
brew services start mysql  # macOS

# Create database
mysql -u root -p < database_schema.sql
```

Or manually:
```sql
CREATE DATABASE gramin_healthcare;
USE gramin_healthcare;
-- Run the queries from database_schema.sql
```

### 2. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
python app.py
```

The backend will run on: `http://localhost:8000`

### 3. Frontend Setup

Simply open `index.html` in your browser or serve it:

```bash
# Using Python's built-in server
python -m http.server 3000

# Or use any web server
```

Access the frontend at: `http://localhost:3000` (or directly via file://)
## 📊 Database Schema

### Tables

1. **users** - User registration data
   - id, name, email, phone, age, village, password, created_at

2. **doctors** - Doctor information
   - id, name, specialization, location, contact_number, fees
   - available_days, start_time, end_time, seat_capacity
   - experience, qualification, rating, is_active

3. **bookings** - Appointment bookings
   - id, user_id, doctor_id, booking_date, token_number
   - fees, status (confirmed/cancelled/completed)

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/doctors` | Get all doctors |
| POST | `/api/doctors/search` | Search doctors |
| GET | `/api/doctors/{id}` | Get specific doctor |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/{user_id}` | Get user bookings |
| POST | `/api/doctors/recommend` | AI recommendation |
| GET | `/api/stats` | System statistics |

## 🤖 ML Model Features

The ML model uses:
- **TF-IDF Vectorization** to process symptom descriptions
- **Cosine Similarity** to match symptoms to conditions
- **Rule-based mapping** for common medical conditions
- **Confidence scoring** to prioritize recommendations

### Supported Symptoms
- Fever, cold, cough, headache
- Child/baby/kid related issues
- Heart/chest problems
- Skin conditions
- Bone/joint issues
- Women's health
- Dental problems
- Herbal/natural remedies

## 🎨 Unique UI Features

- **Gradient色彩方案**: Emerald → Teal → Blue
- **Glass morphism effects**: Blurred, transparent cards
- **Floating animations**: Dynamic medical icons
- **Staggered card animations**: Smooth loading effects
- **Token ticket design**: Beautiful booking confirmations
- **Responsive design**: Mobile-friendly
- **Toast notifications**: User feedback
- **Modal dialogs**: User-friendly forms

## 📱 How to Use

### For Patients (Rural Users)

1. **Register** on the platform
2. **Login** with your credentials
3. **Search Doctors** by:
   - Specialization (General Physician, Pediatrician, Cardiologist, etc.)
   - Location (Your village or nearby)
4. **Or use AI Recommendation**:
   - Describe your symptoms
   - Get matched with the right specialist
5. **Book Appointment**:
   - Select a date
   - Check seat availability
   - Confirm booking
6. **Get Token Number** instantly
7. **Visit "My Bookings"** to view all appointments

### For Doctors

Contact admin to register as a doctor with:
- Name, specialization, qualification
- Location, contact number
- Available days and timings
- Consultation fees
- Seat capacity per day

## 🔧 Configuration

### API URL

Edit `script.js` to change the backend URL:

```javascript
const API_BASE_URL = 'http://localhost:8000';  // Change this
```

### Database Connection

Edit `app.py` to configure MySQL:

```python
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'your_password',  # Change this
    'database': 'gramin_healthcare'
}
```

## 📝 Sample Data

Pre-loaded with 10 doctors across 8 villages:
- 2 General Physicians
- 2 Pediatricians
- 1 Cardiologist
- 1 Orthopedic
- 1 Dermatologist
- 1 Gynecologist
- 1 Dentist
- 1 Ayurveda specialist

## 🧪 Testing

### Test the ML Model

```bash
python ml_model.py
```

### Test API Endpoints

```bash
# Get all doctors
curl http://localhost:8000/api/doctors

# Register user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"1234567890","age":30,"village":"Rampur Village","password":"password123"}'

# Get AI recommendation
curl -X POST "http://localhost:8000/api/doctors/recommend?symptoms=fever and cold"
```

## 🌐 Offline Mode

The frontend works **without backend** using:
- LocalStorage for user data
- LocalStorage for bookings
- Built-in sample doctor data
- Client-side ML recommendation fallback

Perfect for areas with limited internet connectivity!

## 🔐 Security Features

- Password hashing using SHA-256
- SQL injection prevention (parameterized queries)
- CORS configuration
- Input validation with Pydantic
- Seat capacity validation
- Unique token generation per doctor/date

## 📈 Future Enhancements

- [ ] SMS notifications for token numbers
- [ ] Doctor dashboard
- [ ] Payment integration
- [ ] Video consultation
- [ ] Medical records storage
- [ ] Prescription generation
- [ ] Multi-language support
- [ ] Mobile app (React Native)

## 🤝 Contributing

This project is designed to serve rural healthcare. Contributions welcome for:
- Additional sample data
- New village locations
- UI improvements
- ML model enhancements

## 📄 License

Open source for community healthcare initiatives.

## 🙏 Acknowledgments

Built to bridge the healthcare gap for rural and village communities in India.

## 📞 Support

For issues or questions:
- Check the API documentation at `/docs` when running the backend
- Review the code comments
- Test offline mode first

---

**Built with ❤️ for Gramin Bharat**
# EYEWAY — Backend API

## Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
```

## MongoDB
Make sure MongoDB is running on localhost:27017
Download: https://www.mongodb.com/try/download/community

```bash
# Seed demo data (run once)
python seed.py

# Start server
uvicorn main:app --reload
```

API docs: http://localhost:8000/docs

## Demo Credentials
| Role    | Email                     | Password    |
|---------|---------------------------|-------------|
| Admin   | admin@eyeway.gov.in       | admin123    |
| Officer | suresh@eyeway.gov.in      | officer123  |
| Officer | meena@eyeway.gov.in       | officer123  |
| Citizen | priya@email.com           | citizen123  |
| Citizen | rahul@email.com           | citizen123  |

## Role-Based Access
- Citizen  → /my-complaints (own only), /public-complaints (community feed)
- Officer  → /assigned-complaints (only their cases)
- Admin    → /all-complaints (full visibility) + /analytics

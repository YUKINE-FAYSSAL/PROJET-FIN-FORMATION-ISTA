# PROJET-FIN-FORMATION-ISTA

A professional full-stack web application built with **Flask** (Python), **MySQL**, **React.js**, **Kafka**, **Zookeeper**, all managed with **Docker Compose**.

---

## 📦 Project Structure

PROJET-FIN-FORMATION-ISTA/
│
├── app.py # Flask main backend app
├── config.py # Backend configuration
├── models.py # SQLAlchemy models
├── requirements.txt # Python dependencies
├── users.json # Example user data
├── docker-compose.yml # Docker Compose config for all services
├── .env.example # Example environment variables
├── README.md # This documentation file
│
├── library-frontend/ # React frontend application
│ ├── package.json
│ └── src/
│
└── ... (other backend & frontend folders/files)



## 🚀 Quick Start

### 1. **Clone the Repository**
```bash
git clone https://github.com/YUKINE-FAYSSAL/PROJET-FIN-FORMATION-ISTA.git
cd PROJET-FIN-DE-FORMATION-ISTA
2. Set Up Environment Variables
cp .env.example .env
Edit the .env file to configure your Flask, MySQL, and other service credentials as needed.

3. Build and Run All Services
docker-compose up --build
Flask backend: http://localhost:5000

React frontend: http://localhost:3000

MySQL: running inside Docker (check docker-compose.yml for port)

Kafka & Zookeeper: running as services (see docker-compose.yml)

⚙️ Database Migration
To apply database migrations (inside backend container):
docker-compose exec backend flask db upgrade
If your backend service has a different name, replace backend accordingly.

🌐 Frontend Development (React)
cd library-frontend
npm install
npm start
This will start the React dev server on http://localhost:3000

🗂️ Features
User authentication & role management

Real-time notifications using Kafka

RESTful API with Flask

Modern UI built with React

Database migrations with Flask-Migrate

All services managed with Docker Compose

📝 Usage
Register or login as a user

Access your dashboard and explore features

For real-time features, ensure Kafka and Zookeeper are running via Docker Compose

🛠️ Developer Scripts
Backend:
cd backend
flask run
Frontend:

cd library-frontend
npm install
npm start
📬 Contact
For any question or suggestion, open an issue
or contact YUKINE-FAYSSAL.

🤝 Contributing
Pull requests are welcome!
Open an issue to discuss what you’d like to change.

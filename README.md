# 🚀 B4Upload - AI-Powered TikTok Engagement Predictor

<div align="center">

![B4Upload Banner](https://img.shields.io/badge/B4Upload-AI%20Powered-FF0050?style=for-the-badge&logo=tiktok&logoColor=white)

**Optimize your TikTok content before you hit upload!**

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://jolly-flower-0968f7b10.3.azurestaticapps.net/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/codeyzx/b4upload)

*Predict engagement levels • Get optimization insights • Maximize your reach*

</div>

---

## 📖 About

B4Upload is an intelligent platform that leverages machine learning to predict TikTok video engagement **before** you upload. By analyzing video parameters like duration, hashtags, music selection, and posting schedule, B4Upload provides actionable insights to help content creators maximize their reach and engagement.

### ✨ Key Features

- 🎯 **AI-Powered Predictions** - Machine learning models predict engagement levels (HIGH/MEDIUM/LOW)
- ⚡ **Real-time Analysis** - Instant feedback on your video parameters
- 📊 **Trending Insights** - Stay updated with current TikTok trends and metrics
- 🎨 **Modern UI/UX** - Beautiful, responsive interface with dark/light theme support
- 📅 **Smart Scheduling** - Optimize posting times for maximum engagement
- 🔒 **Secure & Fast** - Built on Azure infrastructure for reliability

---

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for blazing-fast builds
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **React Router** for navigation

### Backend
- **Azure Functions** (Python)
- **scikit-learn & LightGBM** for ML models
- **MongoDB** for data persistence
- **TikTok API** integration via RapidAPI

### Deployment
- **Azure Static Web Apps** for frontend hosting
- **Azure Functions** for serverless backend

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **npm** or **yarn**
- **Azure Functions Core Tools** (v4)
- **Git**

### 📦 Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/codeyzx/b4upload.git
cd b4upload
```

#### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
VITE_API_BASE_URL=http://127.0.0.1:7071/api
VITE_RAPIDAPI_KEY=your_rapidapi_key_here
```

---

## 💻 Frontend Setup

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## 🐍 Backend Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
```

### 2. Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### 3. Install Python Dependencies

```bash
pip install -r api/requirements.txt
```

### 4. Configure Local Settings

Edit `api/local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "python",
    "RAPIDAPI_KEY": "your_rapidapi_key_here",
    "MONGODB_URI": "your_mongodb_connection_string"
  }
}
```

### 5. Run Azure Functions Locally

```bash
cd api
func start
```

The backend API will be available at `http://127.0.0.1:7071`

---

## 🎯 Running the Complete Application

### Option 1: Run Both Services Separately

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd api
func start
```

### Option 2: Using Concurrent Processes

Install `concurrently` (if not already installed):
```bash
npm install -D concurrently
```

Add to `package.json` scripts:
```json
"scripts": {
  "dev:all": "concurrently \"npm run dev\" \"cd api && func start\""
}
```

Then run:
```bash
npm run dev:all
```

---

## 🧪 Training ML Models

If you need to retrain the machine learning models:

### 1. Install Training Dependencies

```bash
pip install -r scripts/requirements-train.txt
```

### 2. Run Training Script

```bash
python scripts/train_model.py
```

Trained models will be saved to `api/models/` directory.

---

## 📁 Project Structure

```
b4upload/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   └── *.tsx          # Feature components
│   ├── contexts/          # React Context providers
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── types/             # TypeScript definitions
│   └── App.tsx            # Root component
├── api/                   # Azure Functions backend
│   ├── models/            # ML models (.pkl files)
│   ├── shared/            # Shared utilities
│   ├── function_app.py    # API endpoints
│   └── requirements.txt   # Python dependencies
├── scripts/               # ML training scripts
├── dist/                  # Production build
└── package.json           # Node dependencies
```

---

## 🌐 API Endpoints

### Prediction Endpoint
```
POST /api/predict
```

**Request Body:**
```json
{
  "duration": 30,
  "hashtags": "#fyp #viral #trending",
  "music": "trending_song_name",
  "scheduled_time": "2024-01-15T18:00:00Z"
}
```

**Response:**
```json
{
  "prediction": "HIGH",
  "confidence": 0.87,
  "suggestions": [
    "Great timing! Evening posts perform well",
    "Consider adding 2 more trending hashtags"
  ]
}
```

---

## 🎨 Features in Detail

### 1. Engagement Prediction
Upload your video parameters and get instant AI-powered predictions on potential engagement levels.

### 2. Trending Analysis
View real-time trending content with engagement metrics to inform your content strategy.

### 3. Smart Recommendations
Receive personalized suggestions to optimize your content for maximum reach.

### 4. Theme Customization
Switch between light and dark modes with persistent user preferences.

---

## 🚢 Deployment

### Frontend Deployment (Azure Static Web Apps)

The frontend is automatically deployed to Azure Static Web Apps via GitHub Actions.

**Live URL:** https://jolly-flower-0968f7b10.3.azurestaticapps.net/

### Backend Deployment (Azure Functions)

Backend functions are deployed as part of the Azure Static Web Apps configuration.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**codeyzx**

- GitHub: [@codeyzx](https://github.com/codeyzx)
- Project Link: [https://github.com/codeyzx/b4upload](https://github.com/codeyzx/b4upload)

---

## 🙏 Acknowledgments

- TikTok API via RapidAPI
- Azure Cloud Platform
- Open source community

---

<div align="center">

**Made with ❤️ for Content Creators**

⭐ Star this repo if you find it helpful!

</div>

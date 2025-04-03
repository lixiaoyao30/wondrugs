 
# WonderDrug Site Visualization System

## Project Overview

WonderDrugs is a comprehensive site visualization system that provides real-time monitoring and management of global pharmaceutical sites.

### Core Features

1. **Site Visualization**
   - Interactive world map display
   - Real-time site status monitoring
   - Color-coded status indicators
   - Geographic clustering

2. **Data Management**
   - Site information management
   - Status updates and history
   - Data synchronization with Vault
   - Custom data filtering

3. **Analytics Dashboard**
   - Site performance metrics
   - Status distribution charts
   - Regional analytics
   - Trend analysis

4. **User Management**
   - Role-based access control
   - User authentication
   - Activity logging
   - Permission management

## Technical Stack

### Frontend (React)
- React 18
- TypeScript
- Ant Design Components
- MapBox for visualization
- ECharts for analytics
- Axios for API calls

### Backend (Spring Boot)
- Java 17
- Spring Boot 3.x
- Spring Security
- MySQL Database
- Redis Cache
- Vault Integration




## Deployment Guide

### Quick Integration Steps

Follow these steps to integrate the React frontend with Spring Boot backend:
1) npm run dev  on the react side(https://github.com/lixiaoyao30/wondrugs)
2) ./mvnw spring-boot:run on the java side(https://github.com/lixiaoyao30/wonderdrug-backend-Java)
  



4)
1. **Create Static Directory in Spring Boot**
```bash
# Create static directory in Spring Boot project
mkdir -p backend/src/main/resources/static
```

2. **Build React Frontend**
```bash
# Clone the React project
git clone https://github.com/lixiaoyao30/wondrugs
cd wondrugs

# Install dependencies
npm install

# Build the project
npm run build
to generate  dist folders

3. **Copy Build Files**
```bash
# For Windows:
xcopy /E /I dist backend\src\main\resources\static

# For Mac/Linux:
cp -r dist/* backend/src/main/resources/static/
```

4. **Run Spring Boot Application**
```bash
# Navigate to backend directory
cd backend

# Start the application
./mvnw spring-boot:run
```

The application will be available at: http://localhost:8080

### Directory Structure
```
backend/
└── src/main/resources/
    └── static/           # React build files go here
        ├── index.html
        ├── assets/
        └── ...
```

### Verification Steps
1. Check that all files are copied correctly to the static directory
2. Ensure index.html exists in the static folder
3. Start Spring Boot application
4. Access http://localhost:8080 in your browser

### Common Issues
- If the static directory doesn't exist, create it manually
- Ensure all build files are copied, including assets
- Clear browser cache if you see outdated content


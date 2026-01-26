# 🔄 DayScore - Architecture Flowchart & Visual Diagrams

## 🏗️ **System Architecture Flowchart**

```mermaid
graph TB
    %% User Layer
    subgraph "👤 USER LAYER"
        U1[Web Browser]
        U2[Mobile Browser]
    end

    %% Frontend Layer
    subgraph "📱 FRONTEND LAYER (Port 3000)"
        F1[React App]
        F2[React Router]
        F3[Context API]
        F4[Tailwind CSS]
        F5[Components]
        
        F1 --> F2
        F1 --> F3
        F1 --> F4
        F1 --> F5
    end

    %% API Layer
    subgraph "🌐 API LAYER (Port 5000)"
        A1[Express Server]
        A2[Authentication Middleware]
        A3[Rate Limiting]
        A4[CORS & Security]
        A5[API Routes]
        
        A1 --> A2
        A1 --> A3
        A1 --> A4
        A1 --> A5
    end

    %% Database Layer
    subgraph "🗄️ DATABASE LAYER"
        D1[(MongoDB Atlas)]
        D2[(Firebase Firestore)]
        D3[LocalStorage]
        
        D1 -.-> D2
    end

    %% External Services
    subgraph "🌐 EXTERNAL SERVICES"
        E1[OpenAI API]
        E2[EmailJS]
        E3[Firebase Auth]
    end

    %% Connections
    U1 --> F1
    U2 --> F1
    F1 <--> A1
    A1 <--> D1
    A1 <--> D2
    F1 <--> D3
    F1 <--> E1
    F1 <--> E2
    F1 <--> E3

    %% Styling
    classDef userClass fill:#e1f5fe
    classDef frontendClass fill:#f3e5f5
    classDef apiClass fill:#e8f5e8
    classDef dbClass fill:#fff3e0
    classDef externalClass fill:#fce4ec

    class U1,U2 userClass
    class F1,F2,F3,F4,F5 frontendClass
    class A1,A2,A3,A4,A5 apiClass
    class D1,D2,D3 dbClass
    class E1,E2,E3 externalClass
```

---

## 🔄 **Data Flow Diagram**

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant F as 📱 Frontend
    participant A as 🖥️ API Server
    participant DB as 🗄️ MongoDB
    participant FB as 🔥 Firebase
    participant AI as 🤖 OpenAI
    participant EM as 📧 EmailJS

    %% Authentication Flow
    Note over U,EM: Authentication Flow
    U->>F: Register/Login
    F->>EM: Send OTP Email
    EM-->>U: OTP Email
    U->>F: Enter OTP
    F->>FB: Verify & Store Credentials
    FB-->>F: Auth Success
    F->>A: Request JWT Token
    A-->>F: JWT Token
    F->>F: Store Token & Redirect

    %% Data Operations Flow
    Note over U,AI: Data Operations Flow
    U->>F: Track Task/Mood/Health
    F->>A: API Request (with JWT)
    A->>A: Validate Token
    A->>DB: Store/Retrieve Data
    DB-->>A: Data Response
    A-->>F: API Response
    F->>F: Update UI State

    %% AI Analysis Flow
    Note over U,AI: AI Analysis Flow
    F->>F: Analyze User Context
    F->>AI: Generate AI Insight
    AI-->>F: AI Response
    F->>FB: Store AI History
    F->>F: Display AI Popup
```

---

## 🏗️ **Component Architecture Diagram**

```mermaid
graph TD
    %% App Root
    APP[App.js]
    
    %% Context Providers
    subgraph "🎯 CONTEXT PROVIDERS"
        AC[AuthContext]
        DC[DataContext]
        AIC[AIContext]
    end
    
    %% Layout Components
    subgraph "🎨 LAYOUT COMPONENTS"
        L[Layout.js]
        H[Header.js]
        S[Sidebar.js]
    end
    
    %% Page Components
    subgraph "📄 PAGE COMPONENTS"
        DASH[Dashboard.js]
        TASK[TasksPage.js]
        TIME[TimeTrackerPage.js]
        HEALTH[HealthPage.js]
        MOOD[MoodPage.js]
        ANALYTICS[AnalyticsPage.js]
        PROFILE[ProfilePage.js]
    end
    
    %% Shared Components
    subgraph "🔄 SHARED COMPONENTS"
        AICTL[AIControls.js]
        AIPOP[AIPopup.js]
        LOAD[LoadingSpinner.js]
        LOGO[Logo.js]
    end
    
    %% Services
    subgraph "🌐 SERVICES"
        AUTH[authService.js]
        AISVC[aiService.js]
        HYBRID[hybridAuthService.js]
    end
    
    %% Connections
    APP --> AC
    APP --> DC
    APP --> AIC
    APP --> L
    L --> H
    L --> S
    L --> DASH
    L --> TASK
    L --> TIME
    L --> HEALTH
    L --> MOOD
    L --> ANALYTICS
    L --> PROFILE
    
    DASH --> AICTL
    DASH --> AIPOP
    MOOD --> LOAD
    H --> LOGO
    
    AC --> AUTH
    AC --> HYBRID
    AIC --> AISVC
    DC --> AUTH
```

---

## 🗄️ **Database Schema Diagram**

```mermaid
erDiagram
    %% MongoDB Collections
    USERS {
        ObjectId _id PK
        String email UK
        String name
        Date createdAt
        Date lastLogin
        Object preferences
    }
    
    TASKS {
        ObjectId _id PK
        ObjectId userId FK
        String title
        String description
        String category
        String status
        String priority
        Date dueDate
        Date createdAt
        Date completedAt
    }
    
    TIME_LOGS {
        ObjectId _id PK
        ObjectId userId FK
        String category
        Number duration
        Date date
        Date createdAt
    }
    
    HEALTH_DATA {
        ObjectId _id PK
        ObjectId userId FK
        Date date
        Object sleep
        Object activity
        Object water
    }
    
    MOOD_LOGS {
        ObjectId _id PK
        ObjectId userId FK
        Date date
        Number mood
        Number energy
        Number stress
        String notes
        Number moodScore
        Number wellnessScore
        Date createdAt
    }
    
    DAY_SCORES {
        ObjectId _id PK
        ObjectId userId FK
        Date date
        Number overallScore
        Object breakdown
        Date createdAt
    }
    
    %% Firebase Collections
    USER_CREDENTIALS {
        String uid PK
        String email
        Boolean emailVerified
        Timestamp createdAt
        Timestamp lastLogin
    }
    
    AI_POPUP_HISTORY {
        String id PK
        String userId FK
        String date
        Timestamp timestamp
        String intent
        String tone
        String message
        String cta
        Timestamp shownAt
    }
    
    %% Relationships
    USERS ||--o{ TASKS : "has many"
    USERS ||--o{ TIME_LOGS : "has many"
    USERS ||--o{ HEALTH_DATA : "has many"
    USERS ||--o{ MOOD_LOGS : "has many"
    USERS ||--o{ DAY_SCORES : "has many"
    USERS ||--|| USER_CREDENTIALS : "syncs with"
    USERS ||--o{ AI_POPUP_HISTORY : "has many"
```

---

## 🔐 **Authentication Flow Diagram**

```mermaid
flowchart TD
    START([User Starts Registration/Login])
    
    %% Registration Flow
    REG{Registration?}
    EMAIL[Enter Email & Password]
    SEND_OTP[Send OTP via EmailJS]
    ENTER_OTP[Enter OTP Code]
    VERIFY{OTP Valid?}
    STORE_FB[Store Credentials in Firebase]
    
    %% Login Flow
    LOGIN[Enter Login Credentials]
    CHECK_FB[Check Firebase Credentials]
    VALID{Credentials Valid?}
    
    %% Common Flow
    GEN_JWT[Generate JWT Token]
    STORE_TOKEN[Store JWT in LocalStorage]
    REDIRECT[Redirect to Dashboard]
    ERROR[Show Error Message]
    
    %% Flow Connections
    START --> REG
    REG -->|Yes| EMAIL
    REG -->|No| LOGIN
    
    EMAIL --> SEND_OTP
    SEND_OTP --> ENTER_OTP
    ENTER_OTP --> VERIFY
    VERIFY -->|Yes| STORE_FB
    VERIFY -->|No| ERROR
    STORE_FB --> GEN_JWT
    
    LOGIN --> CHECK_FB
    CHECK_FB --> VALID
    VALID -->|Yes| GEN_JWT
    VALID -->|No| ERROR
    
    GEN_JWT --> STORE_TOKEN
    STORE_TOKEN --> REDIRECT
    ERROR --> START
    
    %% Styling
    classDef processClass fill:#e3f2fd
    classDef decisionClass fill:#fff3e0
    classDef errorClass fill:#ffebee
    classDef successClass fill:#e8f5e8
    
    class EMAIL,SEND_OTP,ENTER_OTP,STORE_FB,LOGIN,CHECK_FB,GEN_JWT,STORE_TOKEN processClass
    class REG,VERIFY,VALID decisionClass
    class ERROR errorClass
    class REDIRECT successClass
```

---

## 🧠 **AI System Flow Diagram**

```mermaid
flowchart TD
    %% Trigger Points
    TASK_COMPLETE[Task Completed]
    SCORE_UPDATE[Day Score Updated]
    PERIODIC[Periodic Check - 30min]
    MANUAL[Manual Trigger]
    
    %% Context Building
    CONTEXT[Build User Context]
    COLLECT[Collect User Data]
    
    subgraph "📊 Data Sources"
        D1[Day Score]
        D2[Task Progress]
        D3[Time Tracking]
        D4[Mood Data]
        D5[Health Metrics]
    end
    
    %% AI Analysis
    ANALYZE[Analyze Context]
    DETERMINE{Determine Intent}
    
    %% Intent Types
    PRAISE[Praise/Motivate]
    CONSOLE[Console/Emotional]
    WARN[Warning/Balance]
    NUDGE[Nudge/Action]
    NONE[No Popup Needed]
    
    %% AI Generation
    OPENAI[Call OpenAI API]
    FALLBACK[Use Fallback Messages]
    API_SUCCESS{API Success?}
    
    %% Popup Display
    GENERATE[Generate Popup]
    DISPLAY[Display to User]
    STORE[Store in Firebase]
    
    %% Recovery Mode Check
    RECOVERY{Recovery Mode?}
    GENTLE[Use Gentle Messaging]
    
    %% Flow Connections
    TASK_COMPLETE --> CONTEXT
    SCORE_UPDATE --> CONTEXT
    PERIODIC --> CONTEXT
    MANUAL --> CONTEXT
    
    CONTEXT --> COLLECT
    COLLECT --> D1
    COLLECT --> D2
    COLLECT --> D3
    COLLECT --> D4
    COLLECT --> D5
    
    D1 --> ANALYZE
    D2 --> ANALYZE
    D3 --> ANALYZE
    D4 --> ANALYZE
    D5 --> ANALYZE
    
    ANALYZE --> RECOVERY
    RECOVERY -->|Yes| GENTLE
    RECOVERY -->|No| DETERMINE
    GENTLE --> DETERMINE
    
    DETERMINE --> PRAISE
    DETERMINE --> CONSOLE
    DETERMINE --> WARN
    DETERMINE --> NUDGE
    DETERMINE --> NONE
    
    PRAISE --> OPENAI
    CONSOLE --> OPENAI
    WARN --> OPENAI
    NUDGE --> OPENAI
    
    OPENAI --> API_SUCCESS
    API_SUCCESS -->|Yes| GENERATE
    API_SUCCESS -->|No| FALLBACK
    FALLBACK --> GENERATE
    
    GENERATE --> DISPLAY
    DISPLAY --> STORE
    
    NONE --> END([End])
    STORE --> END
    
    %% Styling
    classDef triggerClass fill:#e1f5fe
    classDef dataClass fill:#f3e5f5
    classDef aiClass fill:#e8f5e8
    classDef intentClass fill:#fff3e0
    classDef actionClass fill:#fce4ec
    
    class TASK_COMPLETE,SCORE_UPDATE,PERIODIC,MANUAL triggerClass
    class D1,D2,D3,D4,D5 dataClass
    class ANALYZE,OPENAI,FALLBACK aiClass
    class PRAISE,CONSOLE,WARN,NUDGE intentClass
    class GENERATE,DISPLAY,STORE actionClass
```

---

## 📊 **Day Score Calculation Flow**

```mermaid
flowchart TD
    START([Calculate Day Score])
    
    %% Data Collection
    subgraph "📊 Data Collection"
        PROD[Productivity Score - 25%]
        HEALTH[Health Score - 25%]
        FOCUS[Focus Score - 25%]
        WELLNESS[Wellness Score - 25%]
    end
    
    %% Productivity Calculation
    subgraph "⚡ Productivity Calculation"
        TASKS[Task Completion Rate]
        TIME[Time Tracking Efficiency]
        PROD_CALC[Calculate: 85%]
    end
    
    %% Health Calculation
    subgraph "🏥 Health Calculation"
        SLEEP[Sleep Duration & Quality]
        ACTIVITY[Physical Activity]
        WATER[Water Intake]
        HEALTH_CALC[Calculate: 78%]
    end
    
    %% Focus Calculation
    subgraph "🎯 Focus Calculation"
        SCREEN[Screen Time Balance]
        DISTRACTION[Distraction Levels]
        FOCUS_CALC[Calculate: 82%]
    end
    
    %% Wellness Calculation
    subgraph "😊 Wellness Calculation"
        MOOD[Mood Rating 1-5]
        ENERGY[Energy Level 1-10]
        STRESS[Stress Level 1-10]
        NOTES[Note Sentiment Analysis]
        WELLNESS_CALC[Calculate: Dynamic%]
    end
    
    %% Final Calculation
    COMBINE[Combine All Scores]
    FORMULA[Formula: (85×0.25) + (78×0.25) + (82×0.25) + (Wellness×0.25)]
    RESULT[Final Day Score: 80+]
    
    %% Store Result
    STORE[Store in Database]
    UPDATE_UI[Update Dashboard UI]
    
    %% Flow Connections
    START --> PROD
    START --> HEALTH
    START --> FOCUS
    START --> WELLNESS
    
    PROD --> TASKS
    PROD --> TIME
    TASKS --> PROD_CALC
    TIME --> PROD_CALC
    
    HEALTH --> SLEEP
    HEALTH --> ACTIVITY
    HEALTH --> WATER
    SLEEP --> HEALTH_CALC
    ACTIVITY --> HEALTH_CALC
    WATER --> HEALTH_CALC
    
    FOCUS --> SCREEN
    FOCUS --> DISTRACTION
    SCREEN --> FOCUS_CALC
    DISTRACTION --> FOCUS_CALC
    
    WELLNESS --> MOOD
    WELLNESS --> ENERGY
    WELLNESS --> STRESS
    WELLNESS --> NOTES
    MOOD --> WELLNESS_CALC
    ENERGY --> WELLNESS_CALC
    STRESS --> WELLNESS_CALC
    NOTES --> WELLNESS_CALC
    
    PROD_CALC --> COMBINE
    HEALTH_CALC --> COMBINE
    FOCUS_CALC --> COMBINE
    WELLNESS_CALC --> COMBINE
    
    COMBINE --> FORMULA
    FORMULA --> RESULT
    RESULT --> STORE
    STORE --> UPDATE_UI
    
    %% Styling
    classDef scoreClass fill:#e3f2fd
    classDef calcClass fill:#e8f5e8
    classDef resultClass fill:#fff3e0
    
    class PROD,HEALTH,FOCUS,WELLNESS scoreClass
    class PROD_CALC,HEALTH_CALC,FOCUS_CALC,WELLNESS_CALC calcClass
    class RESULT,STORE,UPDATE_UI resultClass
```

---

## 🔄 **State Management Flow**

```mermaid
stateDiagram-v2
    [*] --> AppInitialization
    
    state AppInitialization {
        [*] --> LoadingContexts
        LoadingContexts --> AuthCheck
        AuthCheck --> DataInitialization
        DataInitialization --> UIReady
    }
    
    UIReady --> AuthenticatedState : User Logged In
    UIReady --> UnauthenticatedState : No User
    
    state UnauthenticatedState {
        [*] --> LoginPage
        LoginPage --> RegisterPage : Switch to Register
        RegisterPage --> LoginPage : Switch to Login
        LoginPage --> AuthenticatedState : Successful Login
        RegisterPage --> AuthenticatedState : Successful Registration
    }
    
    state AuthenticatedState {
        [*] --> DashboardState
        
        state DashboardState {
            [*] --> LoadingData
            LoadingData --> DisplayingData
            DisplayingData --> UpdatingData : User Action
            UpdatingData --> DisplayingData : Update Complete
        }
        
        DashboardState --> TaskManagement : Navigate to Tasks
        DashboardState --> TimeTracking : Navigate to Time Tracker
        DashboardState --> HealthTracking : Navigate to Health
        DashboardState --> MoodTracking : Navigate to Mood
        DashboardState --> Analytics : Navigate to Analytics
        DashboardState --> Profile : Navigate to Profile
        
        TaskManagement --> DashboardState : Navigate Back
        TimeTracking --> DashboardState : Navigate Back
        HealthTracking --> DashboardState : Navigate Back
        MoodTracking --> DashboardState : Navigate Back
        Analytics --> DashboardState : Navigate Back
        Profile --> DashboardState : Navigate Back
        
        state AISystem {
            [*] --> Monitoring
            Monitoring --> AnalyzingContext : Trigger Event
            AnalyzingContext --> GeneratingPopup : Context Ready
            GeneratingPopup --> DisplayingPopup : Popup Generated
            DisplayingPopup --> Monitoring : Popup Closed
        }
        
        DashboardState --> AISystem : AI Trigger
        TaskManagement --> AISystem : AI Trigger
        TimeTracking --> AISystem : AI Trigger
        HealthTracking --> AISystem : AI Trigger
        MoodTracking --> AISystem : AI Trigger
    }
    
    AuthenticatedState --> UnauthenticatedState : Logout
    AuthenticatedState --> [*] : App Close
```

---

## 🎯 **Feature Integration Map**

```mermaid
mindmap
  root((DayScore App))
    Authentication
      Email Registration
      OTP Verification
      JWT Tokens
      Firebase Integration
      Session Management
    
    Dashboard
      Day Score Display
      Quick Stats
      Recent Activities
      AI Insights
      Navigation Hub
    
    Task Management
      Academic Tasks
      Personal Tasks
      Priority Levels
      Due Dates
      Progress Tracking
    
    Time Tracking
      Study Timer
      Work Timer
      Entertainment Timer
      Session History
      Daily Reset
    
    Health Monitoring
      Sleep Tracking
      Physical Activity
      Water Intake
      Health Trends
      Goal Setting
    
    Mood & Wellness
      Mood Rating
      Energy Levels
      Stress Tracking
      Emotional Notes
      Wellness Scoring
    
    AI System
      OpenAI Integration
      Context Analysis
      Popup Generation
      Recovery Mode
      Emotional Support
    
    Analytics
      Trend Analysis
      Performance Reports
      Goal Progress
      Insights Dashboard
      Data Visualization
```

---

## 📱 **User Journey Flow**

```mermaid
journey
    title User Daily Journey with DayScore
    
    section Morning Setup
      Open DayScore App: 5: User
      Check Yesterday's Score: 4: User
      Set Today's Goals: 5: User
      Plan Tasks: 4: User
      Start Time Tracking: 5: User
    
    section Midday Activities
      Complete Tasks: 5: User
      Log Water Intake: 4: User
      Receive AI Motivation: 5: User, AI
      Track Study Time: 4: User
      Check Progress: 4: User
    
    section Evening Review
      Log Mood & Wellness: 5: User
      Review Day Score: 4: User
      Analyze Trends: 3: User
      Receive AI Insights: 5: User, AI
      Plan Tomorrow: 4: User
    
    section AI Interactions
      Context Analysis: 5: AI
      Generate Insights: 5: AI
      Emotional Support: 5: AI, User
      Recovery Mode: 4: AI, User
      Popup Notifications: 4: AI, User
```

---

*This comprehensive architecture documentation provides visual representations of the DayScore application's technical structure, data flows, and system interactions. Each diagram serves a specific purpose in understanding different aspects of the application architecture.*

---

**Legend:**
- 🔵 **Blue**: User Interface & Frontend
- 🟢 **Green**: Backend & API Services  
- 🟡 **Yellow**: Database & Storage
- 🟣 **Purple**: External Services & AI
- 🔴 **Red**: Error States & Security
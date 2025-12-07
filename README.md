# Frontend - File Sharing App

React frontend for the file sharing application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. (Optional) Configure API URL in `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm start
```

## Project Structure

- `src/App.js` - Main app component with routing
- `src/context/AuthContext.js` - Authentication context
- `src/components/` - React components:
  - `Login.js` - Login page
  - `Register.js` - Registration page
  - `Dashboard.js` - Main dashboard
  - `FileUpload.js` - File upload component
  - `FileList.js` - File list display
  - `ShareModal.js` - File sharing modal
  - `ShareAccess.js` - Share link access page

## Features

- User authentication (login/register)
- File upload (single or multiple)
- File listing with metadata
- File sharing (users or links)
- File download
- Share link access


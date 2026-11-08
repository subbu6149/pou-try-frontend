# Farm Manager - Frontend

React + TypeScript + Vite frontend for Farm Manager application.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **TailwindCSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **Axios** for API calls
- **React Hot Toast** for notifications

## Features

- 🔐 Phone-based authentication
- 👥 User management with RBAC
- 📱 Complaints system
- 📊 Dashboard with statistics
- 🎨 Modern, responsive UI

## Getting Started

### Prerequisites

- Node.js v18 or higher
- Backend API running on http://localhost:5000

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will run on http://localhost:3000

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Environment

The frontend connects to the backend API through Vite proxy configuration.

Backend URL: `http://localhost:5000`

## Login

Use phone number and password to login:

```
Phone: 9999
Password: 9999
```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── store/          # Zustand state management
│   ├── lib/            # Utilities and API client
│   ├── types/          # TypeScript types
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind configuration
└── package.json        # Dependencies
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

Private and Proprietary

# ISS Admin Dashboard

A modern React-based admin dashboard for Access Control Management, built with Redux Toolkit and Tailwind CSS.

## Features

- 🎨 **Purple Theme**: Beautiful purple color scheme throughout the interface
- 📊 **Data Management**: Complete CRUD operations for access control items
- 🔍 **Advanced Filtering**: Search and filter by keywords, community, and access control type
- 📱 **Responsive Design**: Fully responsive layout that works on all devices
- 🗂️ **Redux Toolkit**: State management with Redux Toolkit for scalable architecture
- 💅 **Tailwind CSS**: Modern utility-first CSS framework
- 🎯 **Type-Safe**: Built with best practices and clean code structure

## Tech Stack

- **React 18.2**: Modern React with hooks
- **Redux Toolkit**: Simplified Redux state management
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **React Redux**: Official React bindings for Redux

## Project Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── Layout.jsx          # Main layout wrapper
│   │   └── Sidebar.jsx         # Navigation sidebar
│   └── AccessControl/
│       ├── Breadcrumbs.jsx     # Breadcrumb navigation
│       ├── FilterBar.jsx       # Search and filter controls
│       ├── DataTable.jsx       # Main data table
│       └── Pagination.jsx      # Pagination controls
├── pages/
│   └── AccessControlList.jsx   # Access control list page
├── store/
│   ├── store.js                # Redux store configuration
│   └── slices/
│       ├── accessControlSlice.js  # Access control state
│       └── navigationSlice.js     # Navigation state
├── App.js                      # Main app component
└── index.js                    # App entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Runs the test suite
- `npm eject` - Ejects from Create React App (one-way operation)

## Features Overview

### Sidebar Navigation
- Collapsible menu items
- Active state highlighting with purple theme
- Hierarchical menu structure
- Icons for better UX

### Access Control List
- View all access control devices
- Edit and delete operations
- Online/offline status indicators
- Remote control for online devices
- Bulk selection and operations

### Filtering & Search
- Keyword search
- Community filter
- Access control type filter
- Real-time filtering

### Data Table
- Sortable columns
- Checkbox selection (single and bulk)
- Action buttons (Edit, Delete, Remote)
- Status indicators
- Responsive design

### Pagination
- Page navigation controls
- Items per page display
- First/last page quick navigation

## Customization

### Changing Colors

The purple theme is configured in `tailwind.config.js`. You can customize the color palette by modifying the `primary` colors:

```javascript
colors: {
  primary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',  // Main purple
    600: '#9333ea',  // Darker purple
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  }
}
```

### Adding New Features

1. Create new components in the `components/` directory
2. Add new Redux slices in `store/slices/` if needed
3. Create new pages in the `pages/` directory
4. Update routes in `App.js`

## Best Practices

This project follows React and Redux best practices:

- Component-based architecture
- Redux Toolkit for state management
- Functional components with hooks
- Tailwind CSS for styling
- Clean and maintainable code structure

## License

This project is private and proprietary.

## Support

For any questions or issues, please contact the development team.


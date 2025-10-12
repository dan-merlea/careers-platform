# Careers Web Setup

## Prerequisites
- MongoDB running on localhost:27017
- Node.js installed

## Installation Steps

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file in the root directory:
```
MONGODB_URI=mongodb://localhost:27017/careers-platform
```

3. Start the development server:
```bash
npm run dev
```

The app will run on http://localhost:3002

## Testing the Timeslots Feature

1. Make sure careers-server is running on port 3001
2. Make sure MongoDB is running
3. Visit: http://localhost:3002/timeslots/{applicationId}

Replace `{applicationId}` with a valid application ID from your database.

## Troubleshooting

### 404 Not Found
- Ensure the dev server is running (`npm run dev`)
- Check that the application ID exists in the database
- Verify MongoDB connection in `.env.local`

### Module Not Found Errors
- Run `npm install` to install all dependencies
- Delete `node_modules` and `.next` folders, then run `npm install` again

### TypeScript Errors
- The app uses Next.js 15 with React 19
- TypeScript errors about mongoose can be ignored during development
- Run `npm run build` to check for build errors

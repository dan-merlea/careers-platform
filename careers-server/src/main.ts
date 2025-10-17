import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Custom CORS middleware that checks request path
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Allow all origins for public API endpoints
    if (req.path.startsWith('/public-api')) {
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
      res.header('Access-Control-Allow-Credentials', 'true');
      
      // Handle preflight
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
    }
    
    next();
  });

  // Enable CORS for other endpoints with whitelist
  app.enableCors({
    origin: [
      'https://hatchbeacon.com',
      'http://localhost:3000',
      'http://localhost:3002',
      'http://localhost:3003',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Use a different port for the backend to avoid conflicts with NextJS
  await app.listen(3001);
  console.log('Server running on http://localhost:3001');
}
bootstrap().catch((err) => console.error('Error starting server:', err));

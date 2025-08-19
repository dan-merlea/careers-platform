import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3002',
      'http://localhost:3003',
    ], // Allow multiple origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  // Use a different port for the backend to avoid conflicts with NextJS
  await app.listen(3001);
  console.log('Server running on http://localhost:3001');
}
bootstrap().catch((err) => console.error('Error starting server:', err));

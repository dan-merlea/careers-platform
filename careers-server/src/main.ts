import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: 'http://localhost:3000', // NextJS default port
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  // Use a different port for the backend to avoid conflicts with NextJS
  await app.listen(3001);
  console.log('Server running on http://localhost:3001');
}
bootstrap().catch((err) => console.error('Error starting server:', err));

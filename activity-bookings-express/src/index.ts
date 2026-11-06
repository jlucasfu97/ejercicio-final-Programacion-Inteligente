// Composition root FIRST: loads persisted data and creates the shared services
import './container';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { logger } from './utils/logger';
import { ErrorResponse } from './types/error';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import activitiesRouter from './routes/activities';
import bookingsRouter from './routes/bookings';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'ActivityBookings API' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/users', usersRouter);
app.use('/login', authRouter);
app.use('/activities', activitiesRouter);
app.use('/bookings', bookingsRouter);

// Unknown routes -> standard JSON error instead of Express' HTML page
app.use((req: Request, res: Response) => {
  const errorResponse: ErrorResponse = { message: `Route ${req.method} ${req.path} not found`, errors: [] };
  res.status(404).json(errorResponse);
});

// Malformed JSON bodies and unexpected errors -> standard JSON error
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    const errorResponse: ErrorResponse = {
      message: 'Request body must be valid JSON',
      errors: [{ field: 'body', message: err.message }],
    };
    return res.status(400).json(errorResponse);
  }
  logger.error('Server', 'Unhandled error', err instanceof Error ? err.message : err);
  const errorResponse: ErrorResponse = { message: 'Internal server error', errors: [] };
  res.status(500).json(errorResponse);
});

app.listen(PORT, () => {
  logger.info('Server', `Running on port ${PORT}`);
});

export default app;

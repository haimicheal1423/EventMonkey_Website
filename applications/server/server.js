import express from 'express';
import cors from 'cors';

import { router as userRouter } from './routes/user.js';
import { router as eventRouter } from './routes/event.js';
import { Database } from './helpers/Database.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: '*',
    methods: ['POST', 'GET', 'PUT', 'DELETE', 'PATCH']
}));

app.use('/users', userRouter);
app.use('/events', eventRouter);

console.info('Initializing database...');
Database.initPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONN_LIMIT
})
.then(() => {
    const PORT = process.env.SERVER_PORT || 4000;
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
})
.catch (error => {
    console.error(error);
    process.exit(1);
});

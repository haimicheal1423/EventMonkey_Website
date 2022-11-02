const dotenv = require('dotenv');
dotenv.config({ path: '.env-local' });

const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const userRouter = require('./routes/user');
const eventRouter = require('./routes/event');

app.use('/users', userRouter);
app.use('/events', eventRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

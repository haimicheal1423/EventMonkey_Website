import express from 'express';
import cors from 'cors';

import { router as userRouter } from './routes/user.js'
import { router as eventRouter } from './routes/event.js'

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.urlencoded({extended:false}));
app.use(cors({
    origin:'*',
    methods:['POST','GET','PUT','DELETE','PATCH']
}));

app.use('/users', userRouter);
app.use('/events', eventRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

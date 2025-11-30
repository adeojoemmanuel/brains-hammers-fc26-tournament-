import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import playerRoutes from './routes/playerRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', playerRoutes);

app.get('/', (req, res) => {
    res.send('eFootball League API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

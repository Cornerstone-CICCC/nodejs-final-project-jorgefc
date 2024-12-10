import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieSession from 'cookie-session';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import userRouter from './routes/user.routes';
import path from 'path';

dotenv.config();
    
const app = express();
const ioServer = createServer(app);
const io = new Server(ioServer, {
    cors: {
        origin: 'http://localhost:4321',
        methods: ['GET', 'POST']
    }
});

app.use(cors({
    origin: 'http://localhost:4321',
    credentials: true
}));

app.use(cookieSession({
    name: 'session',
    keys: [
        process.env.COOKIE_SIGN_KEY ?? 'ifhsiohfihfaf',
        process.env.COOKIE_ENCRYPT_KEY ?? 'fjdiafjaiosjfoe'
    ],
    maxAge: 60 * 60 * 1000 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', userRouter);

const users: Record<string, string> = {};

io.on('connection', (socket) => {
    console.log(`New socket in ${socket.id}`);
    socket.on('chat', (data) => {
        console.log(`${data.username} has sent ${data.message}`);
        users[socket.id] = data.username;
        io.emit('chat', data);
    });

    socket.on('disconnect', () => {
        console.log(`${socket.id} has disconnected`);
        io.emit('chat', { username: 'System', message: `${users[socket.id]} has left` });
    });
});

app.get('/chat', (req: Request, res: Response) => {
    
    if (!req.session?.userId) {
       
        return res.redirect('/login'); 
    }

    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

app.get('/users/me', (req: Request, res: Response) => {
    
    if (!req.session?.userId) {
        return res.status(404).json({ error: 'User not logged in' });
    }

    res.json({ userId: req.session.userId });
});

app.get('/login', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.use((req: Request, res: Response) => {
    res.status(404).send('Access denied');
});

const PORT: number = Number(process.env.PORT || 4000);
ioServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
});

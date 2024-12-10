"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_session_1 = __importDefault(require("cookie-session"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const ioServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(ioServer, {
    cors: {
        origin: 'http://localhost:4321',
        methods: ['GET', 'POST']
    }
});
app.use((0, cors_1.default)({
    origin: 'http://localhost:4321',
    credentials: true
}));
app.use((0, cookie_session_1.default)({
    name: 'session',
    keys: [
        (_a = process.env.COOKIE_SIGN_KEY) !== null && _a !== void 0 ? _a : 'ifhsiohfihfaf',
        (_b = process.env.COOKIE_ENCRYPT_KEY) !== null && _b !== void 0 ? _b : 'fjdiafjaiosjfoe'
    ],
    maxAge: 60 * 60 * 1000
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/users', user_routes_1.default);
const users = {};
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
app.get('/chat', (req, res) => {
    var _a;
    if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.userId)) {
        return res.redirect('/login');
    }
    res.sendFile(path_1.default.join(__dirname, 'public', 'chat.html'));
});
app.get('/users/me', (req, res) => {
    var _a;
    if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.userId)) {
        return res.status(404).json({ error: 'User not logged in' });
    }
    res.json({ userId: req.session.userId });
});
app.get('/login', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'login.html'));
});
app.use((req, res) => {
    res.status(404).send('Access denied');
});
const PORT = Number(process.env.PORT || 4000);
ioServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
});

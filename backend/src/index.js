"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = process.env.PORT || 8000;
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const db = {
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
};
mongoose_1.default.connect(`mongodb+srv://${db.user}:${db.pass}@cluster0.robkk.mongodb.net/test?retryWrites=true&w=majority`, {}).then(() => {
    console.log('connected to db');
}).catch((err) => {
    console.log('Error connecting to db:', err);
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    allowedHeaders: ['Content-Type'],
    origin: ['http://localhost:3000']
}));
app.get('/health', (req, res) => {
    res.send('C2Ladders backend working...');
});
app.use('/', require('./routes/router'));
if (process.env.NODE_ENV === 'production') {
    console.log('env is prod');
    app.use(express_1.default.static('frontend/build'));
    app.get('*', (req, res) => {
        console.log('req: ', req.url);
        res.sendFile(path_1.default.resolve(__dirname, '..', '..', 'frontend', 'build', 'index.html'));
    });
}
else {
    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
}
module.exports = app;

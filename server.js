
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
const secret = 'your_jwt_secret';

// Middleware
app.use(bodyParser.json());
app.use(cors());

// اتصال بقاعدة البيانات
const uri = 'mongodb://localhost:27017/quiz_app';
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to MongoDB');
});

// نموذج المستخدم
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// نموذج السؤال
const questionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: String, required: true }
});

const Question = mongoose.model('Question', questionSchema);

// مسار لإنشاء مستخدم جديد
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(400).send('Error registering user: ' + error.message);
    }
});

// مسار لتسجيل الدخول
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).send('Invalid username or password');
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(404).send('Invalid username or password');
        }
        const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(400).send('Error logging in: ' + error.message);
    }
});

// Middleware للتحقق من التوكن
const auth = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) {
        return res.status(401).send('Access denied');
    }
    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).send('Invalid token');
    }
};

// مسار لإضافة سؤال جديد
app.post('/questions', auth, async (req, res) => {
    try {
        const { question } = req.body;
        const newQuestion = new Question({ userId: req.user.userId, question });
        await newQuestion.save();
        res.status(201).send('Question added successfully');
    } catch (error) {
        res.status(400).send('Error adding question: ' + error.message);
    }
});

// بدء الخادم
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

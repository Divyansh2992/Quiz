const express = require("express");
const mysqlconnection = require("./question.js");
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require("path");
const connection = require("./question.js");
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'quiz_game_secret',
    resave: false,
    saveUninitialized: true,
}));

app.get('/', (req, res) => {
    if (typeof req.session.score === 'undefined') {
        req.session.score = 0;
        req.session.questionsAnswered = 0;
        req.session.askedQuestions = [];
    }

    let sql;
    if (req.session.askedQuestions.length === 0) {
        sql = 'SELECT * FROM questions ORDER BY RAND() LIMIT 1';
    } else {
        const askedQuestions = req.session.askedQuestions.join(',');
        sql = `SELECT * FROM questions WHERE id NOT IN (${askedQuestions}) ORDER BY RAND() LIMIT 1`;
    }

    connection.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
            res.render('final', { finalScore: req.session.score });
        } else {
            req.session.askedQuestions.push(result[0].id);

            // Increment the number of questions answered and set the question number
            req.session.questionsAnswered += 1;
            const questionNumber = req.session.questionsAnswered;

            res.render('app', {
                question: result[0],
                score: req.session.score,
                questionNumber: questionNumber
            });
        }
    });
});

app.post('/submit', (req, res) => {
    const userAnswer = req.body.answer;
    const questionId = req.body.questionId;

    const sql = 'SELECT * FROM questions WHERE id = ?';
    connection.query(sql, [questionId], (err, result) => {
        if (err) throw err;
        const correctAnswer = result[0].answer;
        const isCorrect = userAnswer === correctAnswer;

        // Store the result of the question
        if (!req.session.results) req.session.results = [];
        req.session.results.push({
            question: result[0].question,
            userAnswer: userAnswer,
            correctAnswer: correctAnswer,
            isCorrect: isCorrect
        });

        if (isCorrect) {
            req.session.score += 1;
        }

        res.redirect('/');
    });
});


app.post('/stop', (req, res) => {
    const finalScore = req.session.score;
    const results = req.session.results || [];
    req.session.destroy((err) => {
        if (err) throw err;
        res.render('final', { finalScore, results });
    });
});


app.post('/start-again', (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

app.listen(port, () => {
    console.log(`Server running at port:${port}`);
});

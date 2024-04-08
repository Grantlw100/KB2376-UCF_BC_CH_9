const express = require('express');
const path = require('path');
const notesRouter = require('./routes/index.js');

const PORT = process.env.PORT;

const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'public/index.html'))
);

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/notes.html'));
});

app.use('/api/notes', notesRouter);

app.use(express.static('public'));

app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'public/404.html'))
);



app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);

const notes = require('express').Router();
const { readFromFile, readAndAppend, writeToFile } = require('../helpers/fsUtils');
const { v4: uuidv4 } = require('uuid');




notes.get('/', (req, res) => {
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

notes.post('/', (req, res) => {
    const { title, text } = req.body;

    if (req.body) {
        const newNote = {
            title,
            text,
            id: uuidv4(),
        };

        readAndAppend(newNote, './db/db.json');
        res.json('Note added!');
    } else {
        res.error('Error in adding note');
    }
});

notes.delete('/:id', (req, res) => {
    const noteId = req.params.id;
    readFromFile('./db/db.json')
        .then((data) => JSON.parse(data))
        .then((json) => {
            const result = json.filter((note) => note.id !== noteId);
            writeToFile('./db/db.json', result);
            res.json('Note deleted!');
        });
});

notes.put('/:id', (req, res) => {
    const noteId = req.params.id.toString(); 
    const { title, text } = req.body;
    console.log(title, text, noteId);
    if (req.body) {
        const updatedNote = { title, text, id: noteId };

        readFromFile('./db/db.json')
            .then((data) => JSON.parse(data))
            .then((json) => {
                const result = json.filter((note) => note.id.toString() !== noteId);
                result.push(updatedNote);
                writeToFile('./db/db.json', result);
                res.json({ message: 'Note updated!', data: updatedNote });
            });
    } else {
        res.status(400).json({ error: 'Error in updating note' });
    }
});


module.exports = notes;
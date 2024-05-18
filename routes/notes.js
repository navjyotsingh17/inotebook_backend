const express = require('express');
const router = express.Router();
var fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
// this is added for the @gmail.com, etc validations in the backend
const { body, validationResult } = require('express-validator');

//Route 1: Get all notes using GET request "/api/notes/fetchallnotes". Login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {

    try {
        const notes = await Note.find({ user: req.user.id });

        res.json({ notes });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");

    }


})


//Route 2: Add a note using POST request "/api/notes/addnote". Login required
router.post('/addnote', fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description should >= 5 characters').isLength({ min: 5 })], async (req, res) => {

        try {

            const { title, description, tag } = req.body;

            //check for any errors, return bad request and the error message
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const note = new Note({
                title, description, tag, user: req.user.id
            })

            const savedNote = await note.save()

            res.json({ savedNote });

        } catch (error) {

            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }


    })


//Route 3: Update a exisiting note using PUT request "/api/notes/updatenote/:id". Login required
router.put('/updatenote/:id', fetchuser, async (req, res) => {

    const { title, description, tag } = req.body;

    try {
        //create a new note object
        const newNote = {};

        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        //find a note to be updated and update it
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Note Not Found")
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed")
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });


    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }


})

//Route 4: Delete a exisiting note using DELETE request "/api/notes/deletenote/:id". Login required
router.delete('/deletenote/:id', fetchuser, async (req, res) => {


    try {
        //find a note to be deleted and delete it
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Note Not Found")
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed")
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been deleted", note: note });


    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }


})

module.exports = router
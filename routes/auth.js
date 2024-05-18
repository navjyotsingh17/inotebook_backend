const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');
require("dotenv").config();
const JWT_SCERET = 'Navjyot$'; // this is customizable

//Route 1: Create a POST request "/api/auth/createUser". No login required
router.post('/createUser',
    [
        body('name', 'Enter a valid name').isLength({ min: 3 }),
        body('email', 'Enter a valid email address').isEmail(),
        body('password', 'Password should >= 5 characters').isLength({ min: 5 }),
    ]
    , async (req, res) => {
        // console.log(req.body); 
        // const user = User(req.body);
        // user.save()
        // res.send(req.body);

        //check for any errors, return bad request and the error message

        let success = false;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }


        try {
            //check whethere a user with this email already exists or not
            let user = await User.findOne({ email: req.body.email });
            if (user) {
                return res.status(400).json({ success, error: "Sorry a user with this email already exists" })
            }

            //adding salt to the user password for hashing
            const salt = await bcrypt.genSalt(10);
            secPass = await bcrypt.hash(req.body.password, salt);

            //create a new user
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: secPass
            })

            const data = {
                user: {
                    id: user.id
                }
            }
            const auth_token = jwt.sign(data, JWT_SCERET);
            // console.log(auth_token);
            success = true;
            res.json({ success, auth_token });
            //res.json(user)
        }
        catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }

    })

//Route 2: Authenticate a user using POST request "/api/auth/login". No login required
router.post('/login', [
    body('email', 'Enter a valid email address').isEmail(),
    body('password', 'Password should >= 5 characters').exists(),
]
    , async (req, res) => {
        let success = false;
        //check for any errors, return bad request and the error message
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }


        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            //if the user not exists in the db
            if (!user) {
                return res.status(400).json({success, error: "Please enter proper credentials" });
            }

            //encrypting hte password entered by the user and then comparing it with the hasing password stored in the db
            const passwordCompare = await bcrypt.compare(password, user.password);
            if (!passwordCompare) {
                return res.status(400).json({ success, error: "Please enter proper credentials" });
            }

            const data = {
                user: {
                    id: user.id
                }
            }
            const auth_token = jwt.sign(data, JWT_SCERET)
            success = true;
            res.json({ success, auth_token });

        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal Server Error ");
        }

    })


//Route 3: Get logged in using the POST request "/api/auth/getuser". Login required
router.post('/getuser', fetchuser, async (req, res) => {

    try {
        userid = req.user.id;
        const user = await User.findById(userid).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error ");
    }

})

module.exports = router
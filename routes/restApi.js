// Fetch api
const fetch = require("node-fetch");

// Get express Router
const router = require("express").Router();

// Token verification
const verify = require("./verifyToken");

// Encrypt password
const bcrypt = require("bcryptjs");

// Dot env constants
const dotenv = require("dotenv");
dotenv.config();

// Get aws sdk
var aws = require("aws-sdk");

// AWS S3 configuration
aws.config.update({
    region: "eu-west-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Bucket name
const S3_BUCKET = process.env.AWS_BUCKET_NAME;

// Get the Validation schemas
const { changeUsernameValidation, changeEmailValidation, changePasswordValidation, changeImageValidation, changeSettingsValidation, deleteAccountValidation } = require("../validation");

// Get the User, Room & Restaurant schemes
const User = require("../models/User");

// API to test the token with
router.get("/testToken", verify, (request, response) => {
    response.json({ data: "Random Private Data" });
});

// API to change the username
router.post("/changeUsername", verify, async (request, response) => {
    // Validate data
    const { error } = changeUsernameValidation(request.body);

    // If there is a validation error
    if (error) return response.status(400).json({ error: error.details[0].message });

    try {
        // Deconstruct body
        const { username, newUsername, password } = request.body;

        // Get user
        const user = await User.findOne({ username });
        if (!user) return response.status(400).json({ error: "User does not exist." });

        // Check that the new username isn't already taken
        const repeatedUser = await User.findOne({ username: newUsername });
        if (repeatedUser) return response.status(400).json({ error: "Username not available." });

        // Check if the password is correct
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return response.status(400).json({ error: "Invalid password." });

        // Update User
        await User.findOneAndUpdate({ username }, { $set: { username: newUsername } });

        // Return success
        response.json({ success: true });
    } catch (error) {
        // Return error
        response.status(400).json({ error });
    }
});

// API to change the email
router.post("/changeEmail", verify, async (request, response) => {
    // Validate data
    const { error } = changeEmailValidation(request.body);

    // If there is a validation error
    if (error) return response.status(400).json({ error: error.details[0].message });

    try {
        // Deconstruct body
        const { username, email, password } = request.body;

        // Get user
        const user = await User.findOne({ username });
        if (!user) return response.status(400).json({ error: "User does not exist" });

        // Check that the new email isn't already taken
        const repeatedUser = await User.findOne({ email });
        if (repeatedUser) return response.status(400).json({ error: "Email already taken." });

        // Check if the password is correct
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return response.status(400).json({ error: "Invalid password." });

        // Update User
        await User.findOneAndUpdate({ username }, { $set: { email } });

        // Return success
        response.json({ success: true });
    } catch (error) {
        // Return error
        response.status(400).json({ error });
    }
});

// API to change the password
router.post("/changePassword", verify, async (request, response) => {
    // Validate data
    const { error } = changePasswordValidation(request.body);

    // If there is a validation error
    if (error) return response.status(400).json({ error: error.details[0].message });

    try {
        // Deconstruct body
        const { username, password, newPassword } = request.body;

        // Get user
        const user = await User.findOne({ username });
        if (!user) return response.status(400).json({ error: "User does not exist" });

        // Check if the password is correct
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return response.status(400).json({ error: "Invalid password." });

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update User
        await User.findOneAndUpdate({ username }, { $set: { password: hashedPassword } });

        // Return success
        response.json({ success: true });
    } catch (error) {
        // Return error
        response.status(400).json({ error });
    }
});

// API to change the image
router.post("/changeImage", verify, async (request, response) => {
    // Validate data
    const { error } = changeImageValidation(request.body);

    // If there is a validation error
    if (error) return response.status(400).json({ error: error.details[0].message });

    // Delete from aws
    const deleteImageFromAws = (imageName) => {
        return new Promise((resolve, reject) => {
            // Delete old image from aws
            const s3 = new aws.S3();
            var s3Params = { Bucket: S3_BUCKET, Key: imageName };

            s3.deleteObject(s3Params, (error, data) => {
                // Return the error
                if (error) reject(error);
                resolve(data);
            });
        });
    };

    try {
        // Deconstruct body
        const { username, password, image } = request.body;

        // Get user
        const user = await User.findOne({ username });
        if (!user) return response.status(400).json({ error: "User does not exist" });

        // Check if the password is correct
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return response.status(400).json({ error: "Invalid password." });

        // Update User
        await User.findOneAndUpdate({ username }, { $set: { image } });

        // Delete olf image
        await deleteImageFromAws(user.image.replace("https://matcheat.s3.amazonaws.com/", ""));

        // Return success
        response.json({ success: true });
    } catch (error) {
        // Return error
        if ("message" in error) response.status(400).json({ error: error.message });
        response.status(400).json({ error });
    }
});

// API to change the image
router.post("/changeSettings", verify, async (request, response) => {
    // Validate data
    const { error } = changeSettingsValidation(request.body);

    // If there is a validation error
    if (error) return response.status(400).json({ error: error.details[0].message });

    try {
        // Deconstruct body
        const { username, settings } = request.body;

        // Get user
        const user = await User.findOne({ username });
        if (!user) return response.status(400).json({ error: "User does not exist" });

        // Update User
        await User.findOneAndUpdate({ username }, { $set: { settings } });

        // Return success
        response.json({ success: true });
    } catch (error) {
        // Return error
        response.status(400).json({ error });
    }
});

// API to change the password
router.post("/deleteAccount", verify, async (request, response) => {
    // Validate data
    const { error } = deleteAccountValidation(request.body);

    // If there is a validation error
    if (error) return response.status(400).json({ error: error.details[0].message });

    // Delete from aws
    const deleteImageFromAws = (imageName) => {
        return new Promise((resolve, reject) => {
            // Delete old image from aws
            const s3 = new aws.S3();
            var s3Params = { Bucket: S3_BUCKET, Key: imageName };

            s3.deleteObject(s3Params, (error, data) => {
                // Return the error
                if (error) reject(error);
                resolve(data);
            });
        });
    };

    try {
        // Deconstruct body
        const { username, password } = request.body;

        // Get user
        const user = await User.findOne({ username });
        if (!user) return response.status(400).json({ error: "User does not exist" });

        // Check if the password is correct
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return response.status(400).json({ error: "Invalid password." });

        // Delete User
        await User.deleteOne({ username });

        // Delete olf image
        await deleteImageFromAws(user.image.replace("https://matcheat.s3.amazonaws.com/", ""));

        // Return success
        response.json({ success: true });
    } catch (error) {
        // Return error
        if ("message" in error) response.status(400).json({ error: error.message });
        response.status(400).json({ error });
    }
});

module.exports = router;

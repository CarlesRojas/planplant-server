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
const {
    changeUsernameValidation,
    changeEmailValidation,
    changePasswordValidation,
    changeImageValidation,
    changeSettingsValidation,
    deleteAccountValidation,
    createHomeValidation,
    joinHomeValidation,
    leaveHomeValidation,
} = require("../validation");

// Get the User & Home schemes
const User = require("../models/User");
const Home = require("../models/Home");

// API to test the token with
router.get("/testToken", verify, (request, response) => {
    response.json({ data: "Random Private Data" });
});

// API to change the userName
router.post("/changeUsername", verify, async (request, response) => {
    // Validate data
    const { error } = changeUsernameValidation(request.body);

    // If there is a validation error
    if (error) return response.status(400).json({ error: error.details[0].message });

    try {
        // Deconstruct body
        const { userName, newUserName, password } = request.body;

        // Get user
        const user = await User.findOne({ userName });
        if (!user) return response.status(400).json({ error: "User does not exist." });

        // Check that the new userName isn't already taken
        const repeatedUser = await User.findOne({ userName: newUserName });
        if (repeatedUser) return response.status(400).json({ error: "Username not available." });

        // Check if the password is correct
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return response.status(400).json({ error: "Invalid password." });

        // Update User
        await User.findOneAndUpdate({ userName }, { $set: { userName: newUserName } });

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
        const { userName, email, password } = request.body;

        // Get user
        const user = await User.findOne({ userName });
        if (!user) return response.status(400).json({ error: "User does not exist" });

        // Check that the new email isn't already taken
        const repeatedUser = await User.findOne({ email });
        if (repeatedUser) return response.status(400).json({ error: "Email already taken." });

        // Check if the password is correct
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return response.status(400).json({ error: "Invalid password." });

        // Update User
        await User.findOneAndUpdate({ userName }, { $set: { email } });

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
        const { userName, password, newPassword } = request.body;

        // Get user
        const user = await User.findOne({ userName });
        if (!user) return response.status(400).json({ error: "User does not exist" });

        // Check if the password is correct
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return response.status(400).json({ error: "Invalid password." });

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update User
        await User.findOneAndUpdate({ userName }, { $set: { password: hashedPassword } });

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
        const { userName, password, image } = request.body;

        // Get user
        const user = await User.findOne({ userName });
        if (!user) return response.status(400).json({ error: "User does not exist" });

        // Check if the password is correct
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return response.status(400).json({ error: "Invalid password." });

        // Update User
        await User.findOneAndUpdate({ userName }, { $set: { image } });

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
        const { userName, settings } = request.body;

        // Get user
        const user = await User.findOne({ userName });
        if (!user) return response.status(400).json({ error: "User does not exist" });

        // Update User
        await User.findOneAndUpdate({ userName }, { $set: { settings } });

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
        const { userName, password } = request.body;

        // Get user
        const user = await User.findOne({ userName });
        if (!user) return response.status(400).json({ error: "User does not exist" });

        // Check if the password is correct
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return response.status(400).json({ error: "Invalid password." });

        // Delete User
        await User.deleteOne({ userName });

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

// API to create a home
router.post("/createHome", verify, async (request, response) => {
    // Validate data
    const { error } = createHomeValidation(request.body);

    // If there is a validation error
    if (error) return response.status(400).json({ error: error.details[0].message });

    // Body deconstruction
    const { homeName, password, image } = request.body;

    try {
        // Check if the name has already been used
        const homeExists = await Home.findOne({ homeName });
        if (homeExists) return response.status(400).json({ error: "Home name not available." });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create Home
        const home = new Home({
            homeName,
            password: hashedPassword,
            image,
        });

        // Save home to DB
        await home.save();

        // Return the home in the response
        response.json({ id: home._id });
    } catch (error) {
        // Return DB error
        response.status(400).json({ error });
    }
});

// API to join a home
router.post("/joinHome", verify, async (request, response) => {
    // Validate data
    const { error } = joinHomeValidation(request.body);

    // If there is a validation error
    if (error) return response.status(400).json({ error: error.details[0].message });

    // Body deconstruction
    const { homeName, userName, password } = request.body;

    try {
        // Check if the home exists
        const home = await Home.findOne({ homeName });
        if (!home) return response.status(400).json({ error: "Home does not exist." });

        // Check if the user exists
        const user = await User.findOne({ userName });
        if (!user) return response.status(400).json({ error: "User does not exist." });

        // Check if the password is correct
        const validPassword = await bcrypt.compare(password, home.password);
        if (!validPassword) return response.status(400).json({ error: "Invalid password." });

        // Add home to the user
        await User.findOneAndUpdate({ userName }, { $set: { homeName } });

        // Add user to the home
        await Home.findOneAndUpdate({ homeName }, { $push: { users: { userName: user.userName, image: user.image } } });

        // Return success
        response.json({ success: true });
    } catch (error) {
        // Return DB error
        response.status(400).json({ error });
    }
});

// API to leave a home
router.post("/leaveHome", verify, async (request, response) => {
    // Validate data
    const { error } = leaveHomeValidation(request.body);

    // If there is a validation error
    if (error) return response.status(400).json({ error: error.details[0].message });

    // Body deconstruction
    const { userName } = request.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ userName });
        if (!user) return response.status(400).json({ error: "User does not exist." });

        // Check if the home exists
        const home = await Home.findOne({ homeName: user.homeName });
        if (!home) return response.status(400).json({ error: "Home does not exist." });

        // Remove home from the user
        await User.findOneAndUpdate({ userName }, { $unset: { homeName: user.homeName } });

        // Remove user from the home
        await Home.findOneAndUpdate({ homeName: user.homeName }, { $pull: { users: { userName } } }, { safe: true, multi: true });

        // Return success
        response.json({ success: true });
    } catch (error) {
        // Return DB error
        response.status(400).json({ error });
    }
});

module.exports = router;

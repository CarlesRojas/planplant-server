const Joi = require("joi");

// Register validation
const registerValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(12).required(),
        email: Joi.string().min(6).max(256).required().email(),
        password: Joi.string().min(6).max(1024).required(),
        image: Joi.string().min(6).max(1024).required(),
    });

    return schema.validate(data);
};

// Login validation
const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().min(6).max(256).required().email(),
        password: Joi.string().min(6).max(1024).required(),
    });

    return schema.validate(data);
};

// Upload to S3 validation
const getS3URLValidation = (data) => {
    const schema = Joi.object({
        fileName: Joi.string().min(6).max(1024).required(),
        fileType: Joi.string().min(6).max(1024).required(),
    });

    return schema.validate(data);
};

// Change Username validation
const changeUsernameValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(12).required(),
        newUsername: Joi.string().alphanum().min(3).max(12).required(),
        password: Joi.string().required(),
    });

    return schema.validate(data);
};

// Change Email validation
const changeEmailValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(12).required(),
        email: Joi.string().min(6).max(256).required().email(),
        password: Joi.string().required(),
    });

    return schema.validate(data);
};

// Change Password validation
const changePasswordValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(12).required(),
        password: Joi.string().required(),
        newPassword: Joi.string().min(6).max(1024).required(),
    });

    return schema.validate(data);
};

// Change Image validation
const changeImageValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(12).required(),
        password: Joi.string().required(),
        image: Joi.string().min(6).max(1024).required(),
    });

    return schema.validate(data);
};

// Change Settings validation
const changeSettingsValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(12).required(),
        settings: Joi.required(),
    });

    return schema.validate(data);
};

// Delete account validation
const deleteAccountValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string().alphanum().min(3).max(12).required(),
        password: Joi.string().required(),
    });

    return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.getS3URLValidation = getS3URLValidation;
module.exports.changeUsernameValidation = changeUsernameValidation;
module.exports.changeEmailValidation = changeEmailValidation;
module.exports.changePasswordValidation = changePasswordValidation;
module.exports.changeImageValidation = changeImageValidation;
module.exports.changeSettingsValidation = changeSettingsValidation;
module.exports.deleteAccountValidation = deleteAccountValidation;

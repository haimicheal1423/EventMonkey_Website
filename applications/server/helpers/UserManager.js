import bcrypt from 'bcrypt';

import { DataSource } from './Database.js';
import { TYPE_ATTENDEE, TYPE_ORGANIZER, Attendee, Organizer } from '../models/User.js';

export class UserManager {

    /**
     * @private
     * @const
     * @type {DataSource}
     */
    dataSource_;

    constructor(dataSource) {
        this.dataSource_ = dataSource;
    }

    /**
     * Gets the user details.
     *
     * @param {number} userId the EventMonkey user id
     *
     * @returns {Promise<User | { message: string }>} the user object if it
     *     exists, otherwise a message on failure
     */
    async getUser(userId) {
        const userDetails = await this.dataSource_.getUserDetails(userId);

        if (!userDetails) {
            return { message: `User(${userId}) does not exist` };
        }

        const { getImage } = this.dataSource_;
        const profileImage = await getImage(userDetails.profileImageId);

        // TODO: are user details enough, or should type-specific properties
        //       like attendee interests and event lists also be loaded?

        switch (userDetails.type.toUpperCase()) {
            case TYPE_ATTENDEE:
                return new Attendee(
                    userId,
                    userDetails.email,
                    userDetails.password,
                    userDetails.username,
                    profileImage
                );

            case TYPE_ORGANIZER:
                return new Organizer(
                    userId,
                    userDetails.email,
                    userDetails.password,
                    userDetails.username,
                    profileImage
                );

            default:
                return { message: `Unknown user type (${userDetails.type})` };
        }
    }

    /**
     * Registers a new user to the database.
     *
     * @param {string} type
     * @param {string} username
     * @param {string} email
     * @param {string} password
     * @returns {Promise<Attendee|Organizer|{ message: string }>} a new user
     *     object with an id if successful, otherwise a failure message
     */
    async register(type, username, email, password) {
        // TODO: shouldn't this be done in the client before getting sent
        //       through the network?
        const encryptedPassword = await bcrypt.hash(password, 10);

        // TODO: Verify that the parameters exist and the string length fits
        //       with the database text size. Also verify username and email
        //       match a specific pattern, like username cannot contain special
        //       characters, and emails must be in the correct format

        const { isEmailUnique, isUsernameUnique } = this.dataSource_;

        const uniqueUsername = await isUsernameUnique(username);

        if (!uniqueUsername) {
            return { message: `Username ${username} already in use`};
        }

        const uniqueEmail = await isEmailUnique(email);

        if (!uniqueEmail) {
            return { message: `Email ${email} already in use`};
        }

        let user;

        switch (type.toUpperCase()) {
            case TYPE_ATTENDEE:
                user = new Attendee(
                    undefined,
                    email,
                    encryptedPassword,
                    username
                );
                break;

            case TYPE_ORGANIZER:
                user = new Organizer(
                    undefined,
                    email,
                    encryptedPassword,
                    username
                );
                break;

            default:
                return { message: `Unknown user type (${type})` };
        }

        const userId = await this.dataSource_.addUserDetails(user);

        if (!userId) {
            return { message: `Failed to add user details` };
        }

        // cast BigInt into regular number
        user.id = Number(userId);

        return user;
    }

    /**
     * Verifies user login details by matching the email and password
     * combination. If the details match the data in the database, then the
     * `{ email, password, username }` details are returned.
     *
     * @param {string} email
     * @param {string} password
     *
     * @returns {Promise<
     *           {message: string}
     *         | {email: string, password: string, username: string}
     *     >} the login details, or a failure message
     */
    async login(email, password) {
        const loginDetails = await this.dataSource_.getLoginDetails(email);

        if (!loginDetails) {
            // no login details exist for this email in the data source
            return { message: 'Invalid username or password.' };
        }

        const validatePassword = (plainText, hashed) => {
            return new Promise((resolve, reject) => {
                bcrypt.compare(plainText, hashed, (err, matched) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(matched);
                    }
                });
            });
        }

        const valid = await validatePassword(password, loginDetails.password);

        if (valid) {
            return loginDetails;
        } else {
            return { message: 'Invalid username or password.' };
        }
    }
}

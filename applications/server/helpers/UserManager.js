import bcrypt from 'bcrypt';

import { DataSource } from './Database.js';
import { TYPE_ATTENDEE, TYPE_ORGANIZER, Attendee, Organizer } from '../models/User.js';
import { eventManager } from "../routes/event.js";

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
     * Checks if a user is of the given type. If the user does not exist or if
     * the type does not match, then a failure message will be returned.
     *
     * @param {number} userId the EventMonkey user id
     * @param {string} userType the type of user
     *
     * @returns {Promise<{message: string}|undefined>} a message if the user
     *     does not exist or if the type does not match, or undefined if success
     */
    async checkUserType(userId, userType) {
        const userDetails = await this.dataSource_.getUserDetails(userId);

        if (!userDetails) {
            return { message: `User(${userId}) does not exist` };
        }

        if (userDetails.type !== userType) {
            return { message: `User(${userId}) is not type ${userType}` };
        }

        return undefined;
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

    /**
     * Gets an array of events in the {@link Organizer} event list. This
     * function will verify that the user id references a user which has
     * {@link TYPE_ORGANIZER} as a user type.
     *
     * @param {number} userId the EventMonkey user id
     *
     * @returns {Promise<{message: string} | Event[]>} an array of events which
     *     the organizer has created, or a failure message if the user does not
     *     have a {@link TYPE_ORGANIZER} user type
     */
    async getCreatedEvents(userId) {
        const failMessage = await this.checkUserType(userId, TYPE_ORGANIZER);

        if (failMessage) {
            // user is not organizer type
            return { message: failMessage.message };
        }

        return await eventManager.findEventsByUserId(userId);
    }

    /**
     * Gets an array of events in the {@link Attendee} event list. This
     * function will verify that the user id references a user which has
     * {@link TYPE_ATTENDEE} as a user type.
     *
     * @param {number} userId the EventMonkey user id
     *
     * @returns {Promise<{message: string} | Event[]>} an array of events which
     *     the attendee has added to their favorites, or a failure message if
     *     the user does not have a {@link TYPE_ATTENDEE} user type
     */
    async getFavorites(userId) {
        const failMessage = await this.checkUserType(userId, TYPE_ATTENDEE);

        if (failMessage) {
            // user is not attendee type
            return { message: failMessage.message };
        }

        return await eventManager.findEventsByUserId(userId);
    }

    /**
     * Adds an event to the attendees favorites list. The user id must point to
     * a record of an Attendee user type.
     *
     * @param {number} userId the EventMonkey user id
     * @param {number|string} eventId the EventMonkey or TicketMaster event id
     *
     * @returns {Promise<{message: string|'success'}>} a failure message, or
     *     'success' if the event was successfully added to favorites
     */
    async addToFavorites(userId, eventId) {
        const failMessage = await this.checkUserType(userId, TYPE_ATTENDEE);

        if (failMessage) {
            // user is not attendee type
            return { message: failMessage.message };
        }

        const event = await eventManager.findEventById({ eventId });

        if (!event) {
            return { message: `Event(${eventId}) does not exist` };
        }

        await eventManager.addEventToList(userId, event);

        return { message: 'success' };
    }

    /**
     * Removes an event from the attendees favorites list. The user id must
     * point to a record of an Attendee user type.
     *
     * @param {number} userId the EventMonkey user id
     * @param {number|string} eventId the EventMonkey or TicketMaster event id
     *
     * @returns {Promise<{message: string|'success'}>} a failure message, or
     *     'success' if the event was successfully removed from favorites
     */
    async removeFromFavorites(userId, eventId) {
        const failMessage = await this.checkUserType(userId, TYPE_ATTENDEE);

        if (failMessage) {
            // user is not attendee type
            return { message: failMessage.message };
        }

        const event = await eventManager.findEventById({ eventId });

        if (!event) {
            return { message: `Event(${eventId}) does not exist` };
        }

        await eventManager.removeEventFromList(userId, event);

        return { message: 'success' };
    }

    /**
     * Gets the genre list that the user has added as their interests
     *
     * @param {number} userId the EventMonkey user id
     *
     * @returns {Promise<{message: string} | Genre[]>} a failure message if the
     *     user is not an {@link TYPE_ATTENDEE} user type, or the array of
     *     genres in the interests list
     */
    async getInterests(userId) {
        const failMessage = await this.checkUserType(userId, TYPE_ATTENDEE);

        if (failMessage) {
            // user is not attendee type
            return { message: failMessage.message };
        }

        return await this.dataSource_.getInterestList(userId);
    }

    /**
     * Adds an event to the attendees favorites list. The user id must point to
     * a record of an Attendee user type.
     *
     * @param {number} userId the EventMonkey user id
     * @param {number} genreId the genre id to add to interests
     *
     * @returns {Promise<{message: string|'success'}>} a failure message, or
     *     'success' if the genre was added to interests
     */
    async addToInterests(userId, genreId) {
        const failMessage = await this.checkUserType(userId, TYPE_ATTENDEE);

        if (failMessage) {
            // user is not attendee type
            return { message: failMessage.message };
        }

        await this.dataSource_.addToInterests(userId, genreId);

        return { message: 'success' };
    }

    /**
     * Removes an event from the attendees favorites list. The user id must
     * point to a record of an Attendee user type.
     *
     * @param {number} userId the EventMonkey user id
     * @param {number} genreId the genre id to remove from interests
     *
     * @returns {Promise<{message: string|'success'}>} a failure message, or
     *     'success' if the genre was successfully removed from interests
     */
    async removeFromInterests(userId, genreId) {
        const failMessage = await this.checkUserType(userId, TYPE_ATTENDEE);

        if (failMessage) {
            // user is not attendee type
            return { message: failMessage.message };
        }

        await this.dataSource_.removeFromInterests(userId, genreId);

        return { message: 'success' };
    }
}

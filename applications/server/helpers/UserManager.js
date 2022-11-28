import bcrypt from 'bcryptjs';

import { DataSource } from './Database.js';
import { TYPE_ATTENDEE, TYPE_ORGANIZER, Attendee, Organizer } from '../models/User.js';
import { SOURCE_EVENT_MONKEY, SOURCE_TICKET_MASTER } from "../models/Event.js";

export class UserManager {

    /**
     * @private
     * @const
     * @type {DataSource}
     */
    dataSource_;

    /**
     * @param {DataSource} dataSource
     */
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
     * @returns {Promise<Attendee | Organizer | { message: string }>} the user
     *     object if it exists, otherwise a message on failure
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
     * @returns {Promise<{message: string} | {
     *         userId: number,
     *         email: string,
     *         password: string,
     *         username: string
     *     }>} the login details, or a failure message
     */
    async login(email, password) {
        const details = await this.dataSource_.getLoginDetails(email);

        if (!details) {
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

        try {
            const valid = await validatePassword(password, details.password);

            if (valid) {
                return details;
            } else {
                return { message: 'Invalid username or password.' };
            }
        } catch (error) {
            console.error(error);
            return { message: 'Invalid username or password.' };
        }
    }

    /**
     * Adds an event to the attendees favorites list. The user id must point to
     * a record of an Attendee user type.
     *
     * @param {number} userId the EventMonkey user id
     * @param {Event} event the EventMonkey or TicketMaster event
     *
     * @returns {Promise<{message: string|'success'}>} a failure message, or
     *     'success' if the event was successfully added to favorites
     */
    async addToFavorites(userId, event) {
        const failMessage = await this.checkUserType(userId, TYPE_ATTENDEE);

        if (failMessage) {
            // user is not attendee type
            return { message: failMessage.message };
        }

        const {
            addToEventMonkeyList,
            addToTicketMasterList
        } = this.dataSource_;

        switch (event.source.toUpperCase()) {
            case SOURCE_EVENT_MONKEY:
                await addToEventMonkeyList(userId, event.id);
                break;
            case SOURCE_TICKET_MASTER:
                await addToTicketMasterList(userId, event.id);
                break;
            default:
                return { message: `Unknown event source: ${event.source}` };
        }

        return { message: 'success' };
    }

    /**
     * Removes an event from the attendees favorites list. The user id must
     * point to a record of an Attendee user type.
     *
     * @param {number} userId the EventMonkey user id
     * @param {Event} event the EventMonkey or TicketMaster event
     *
     * @returns {Promise<{message: string|'success'}>} a failure message, or
     *     'success' if the event was successfully removed from favorites
     */
    async removeFromFavorites(userId, event) {
        const failMessage = await this.checkUserType(userId, TYPE_ATTENDEE);

        if (failMessage) {
            // user is not attendee type
            return { message: failMessage.message };
        }

        const {
            removeFromEventMonkeyList,
            removeFromTicketMasterList
        } = this.dataSource_;

        switch (event.source.toUpperCase()) {
            case SOURCE_EVENT_MONKEY:
                await removeFromEventMonkeyList(userId, event.id);
                break;
            case SOURCE_TICKET_MASTER:
                await removeFromTicketMasterList(userId, event.id);
                break;
            default:
                return { message: `Unknown event source: ${event.source}` };
        }

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
     * @param {string} genreName the genre name to add to interests
     *
     * @returns {Promise<Genre | {message: string}>} a failure message, or
     *     'success' if the genre was added to interests
     */
    async addToInterests(userId, genreName) {
        const failMessage = await this.checkUserType(userId, TYPE_ATTENDEE);

        if (failMessage) {
            // user is not attendee type
            return { message: failMessage.message };
        }

        let genre = await this.dataSource_.getGenreId(genreName);

        if (!genre) {
            genre = await this.dataSource_.addGenre(genreName);
        }

        if (!genre) {
            return { message: 'Could not add genre to interests' };
        }

        await this.dataSource_.addToInterests(userId, genre.id);

        return genre;
    }

    /**
     * Removes an event from the attendees favorites list. The user id must
     * point to a record of an Attendee user type.
     *
     * @param {number} userId the EventMonkey user id
     * @param {string} genreName the genre name to remove from interests
     *
     * @returns {Promise<{message: string|'success'}>} a failure message, or
     *     'success' if the genre was successfully removed from interests
     */
    async removeFromInterests(userId, genreName) {
        const failMessage = await this.checkUserType(userId, TYPE_ATTENDEE);

        if (failMessage) {
            // user is not attendee type
            return { message: failMessage.message };
        }

        let genre = await this.dataSource_.getGenreId(genreName);

        if (!genre) {
            genre = await this.dataSource_.addGenre(genreName);
        }

        if (!genre) {
            return { message: 'Could not remove genre from interests' };
        }

        await this.dataSource_.removeFromInterests(userId, genre.id);

        return { message: 'success' };
    }

    /**
     * Gets the attendees friends list. The user id must point to a record of an
     * Attendee user type.
     *
     * @param {number} userId the EventMonkey user id
     *
     * @returns {Promise<
     *         { userId: number, username: string, profileImage: Image }[]
     *         | { message: string }
     *     >} a failure message, or
     *     an array of constructed {@link Attendee} objects in the friends list
     */
    async getFriendsList(userId) {
        const failMessage = await this.checkUserType(userId, TYPE_ATTENDEE);

        if (failMessage) {
            // user is not attendee type
            return { message: failMessage.message };
        }

        const friendIds = await this.dataSource_.getFriendList(userId);

        const friends = await Promise.all(
            friendIds.map(friendId => {
                return this.getUser(friendId);
            })
        );

        /**
         * @type {{ userId: number, username: string, profileImage: Image }[]}
         */
        const attendeeFriends = [];

        for (let i = 0; i < friends.length; i++){
            const friend = friends[i];

            if (friend.type === TYPE_ATTENDEE) {
                attendeeFriends.push({
                    userId: friend.id,
                    username: friend.username,
                    profileImage: friend.profileImage
                });
            }
        }

        return attendeeFriends;
    }

    /**
     * Adds a friend to the attendees friends list. Both the user id and friend
     * id must point to a record of an Attendee user type.
     *
     * @param {number} userId the EventMonkey user id
     * @param {string} username the friend's username
     *
     * @returns {Promise<
     *     { userId: number, username: string, profileImage: Image }
     *     | {message: string}>} a failure message, or the simplified user
     *     details for the friend
     */
    async addToFriends(userId, username) {
        const userFailMsg = await this.checkUserType(userId, TYPE_ATTENDEE);

        if (userFailMsg) {
            // user is not attendee type
            return { message: userFailMsg.message };
        }

        const friendId = await this.dataSource_.getUserId(username);

        if (!friendId) {
            // no user found for given username
            return { message: `User ${username} does not exist` };
        }

        const friendFailMsg = await this.checkUserType(friendId, TYPE_ATTENDEE);

        if (friendFailMsg) {
            // friend is not attendee type
            return { message: friendFailMsg.message };
        }

        await this.dataSource_.addToFriends(userId, friendId);

        const friend = await this.dataSource_.getUserDetails(friendId);

        const { getImage } = this.dataSource_;
        const profileImage = await getImage(friend.profileImageId);

        return {
            userId: friendId,
            username: username,
            profileImage
        };
    }

    /**
     * Removes a friend from the attendees friends list. The user id must
     * point to a record of an Attendee user type.
     *
     * @param {number} userId the EventMonkey user id
     * @param {string} username the friend's username
     *
     * @returns {Promise<{message: string|'success'}>} a failure message, or
     *     'success' if the user was successfully removed from the friends list
     */
    async removeFromFriends(userId, username) {
        const failMessage = await this.checkUserType(userId, TYPE_ATTENDEE);

        if (failMessage) {
            // user is not attendee type
            return { message: failMessage.message };
        }

        const friendId = await this.dataSource_.getUserId(username);

        if (!friendId) {
            // no user found for given username
            return { message: `User ${username} does not exist` };
        }

        await this.dataSource_.removeFromFriends(userId, friendId);

        return { message: 'success' };
    }
}

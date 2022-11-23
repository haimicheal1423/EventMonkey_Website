import mariadb from 'mariadb';

import { Image } from "../models/Image.js";
import { Genre } from "../models/Genre.js";

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONN_LIMIT || 10,
});

export class Database {

    /**
     * Queries the database with optional query values.
     *
     * @param {string} sql the sql query to execute
     * @param {any|any[]} [values] optional values to execute the query
     * @returns {Promise<any>} the database result
     */
    static async query(sql, values) {
        let conn;
        try {
            conn = await pool.getConnection();
            return await conn.query(sql, values);
        } catch (err) {
            throw err;
        } finally {
            if (conn) {
                await conn.release();
            }
        }
    }

    /**
     * Runs a batched query.
     *
     * @param {string} sql the sql query to execute
     * @param {any|any[]} values values to execute the batched query
     * @returns {Promise<mariadb.UpsertResult>
     *         | Promise<mariadb.UpsertResult[]>} the database result
     */
    static async batch(sql, values) {
        let conn;
        try {
            conn = await pool.getConnection();
            return await conn.batch(sql, values);
        } catch (err) {
            throw err;
        } finally {
            if (conn) {
                await conn.release();
            }
        }
    }
}

/**
 * A data source provides an api to manage data related to users and events.
 * @abstract
 */
export class DataSource {

    constructor() {
        if (this.constructor === DataSource) {
            throw new Error('Cannot instantiate abstract class');
        }
    }

    /* ********** USERS ********** */

    /**
     * Tests if an email already exists in the backing data source.
     *
     * @param {string} email the email to check
     *
     * @returns {Promise<boolean>} `true` if the email is unique
     * @abstract
     */
    async isEmailUnique(email) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Tests if a username already exists in the backing data source.
     *
     * @param {string} username the username to check
     *
     * @returns {Promise<boolean>} `true` if the username is unique
     * @abstract
     */
    async isUsernameUnique(username) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Gets the login details (email, password, username) using the given email
     * from the backing data source.
     *
     * @param {string} email the email to check
     *
     * @returns {Promise<{email: string, password: string, username: string}>}
     *     the login details
     * @abstract
     */
    async getLoginDetails(email) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Adds user details to the backing data source.
     *
     * @param {User} user the user to add
     *
     * @returns {Promise<number>} the id of the data source record
     * @abstract
     */
    async addUserDetails(user) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Adds an association between an EventMonkey event and the user to the
     * backing data source.
     *
     * @param {number} userId the id of the data source's user record
     * @param {number} eventId the id of the data source's event record
     *
     * @returns {Promise<boolean>} `true` if the data source added a record
     * @abstract
     */
    async addToEventMonkeyList(userId, eventId) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Removes an association between an EventMonkey event and the user from the
     * backing data source.
     *
     * @param {number} userId the id of the data source's user record
     * @param {number} eventId the id of the data source's event record
     *
     * @returns {Promise<boolean>} `true` if the data source removed a record
     * @abstract
     */
    async removeFromEventMonkeyList(userId, eventId) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Adds an association between a TicketMaster event and the user to the
     * backing data source.
     *
     * @param {number} userId the id of the data source's user record
     * @param {string} eventId the id of the data source's event record
     *
     * @returns {Promise<boolean>} `true` if the data source added a record
     * @abstract
     */
    async addToTicketMasterList(userId, eventId) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Removes an association between a TicketMaster event and the user from the
     * backing data source.
     *
     * @param {number} userId the id of the data source's user record
     * @param {string} eventId the id of the data source's event record
     *
     * @returns {Promise<boolean>} `true` if the data source removed a record
     * @abstract
     */
    async removeFromTicketMasterList(userId, eventId) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Adds a friend to the user's friends list.
     *
     * @param {number} userId the id of the data source's user record
     * @param {number} friendId the id of the friend in the data source's user
     *     record
     *
     * @returns {Promise<void>}
     * @abstract
     */
    async addToFriends(userId, friendId) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Removes a friend from the user's friends list.
     *
     * @param {number} userId the id of the data source's user record
     * @param {number} friendId the id of the friend in the data source's user
     *     record
     *
     * @returns {Promise<void>}
     * @abstract
     */
    async removeFromFriends(userId, friendId) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Adds one or more genres to the user's interest list.
     *
     * @param {number} userId the id of the data source's user record
     * @param {number} genreId the genre id to add to interests
     *
     * @returns {Promise<void>}
     * @abstract
     */
    async addToInterests(userId, genreId) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Removes one or more genres from the user's interest list.
     *
     * @param {number} userId the id of the data source's user record
     * @param {number} genreId the genre id to remove from interests
     *
     * @returns {Promise<void>}
     * @abstract
     */
    async removeFromInterests(userId, genreId) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Gets the user details from the backing data source.
     *
     * @param {number} userId the EventMonkey user id
     *
     * @returns {Promise<{
     *         type: string,
     *         email: string,
     *         password: string,
     *         username: string,
     *         profileImageId: number
     *     }>}
     * @abstract
     */
    async getUserDetails(userId) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Gets the event ids stored in a user's EventMonkey event list.
     *
     * @param {number} userId
     *
     * @returns {Promise<number[]>} an array of event ids
     * @abstract
     */
    async getEventMonkeyList(userId) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Gets the event ids stored in a user's TicketMaster event list.
     *
     * @param {number} userId
     *
     * @returns {Promise<number[]>} an array of event ids
     * @abstract
     */
    async getTicketMasterList(userId) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Gets the genre list that the user has added as their interests.
     *
     * @param {number} userId the id of the data source's user record
     *
     * @returns {Promise<Genre[]>}
     * @abstract
     */
    async getInterestList(userId) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Gets an array of user ids list that the user has added to their friends
     * list.
     *
     * @param {number} userId the id of the data source's user record
     *
     * @returns {Promise<number[]>} the user ids in the friends list
     * @abstract
     */
    async getFriendList(userId) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Gets a unique array of genres using an attendee's friends list. The genre
     * names are fetched from each user in the friends list and combined
     * into one array.
     *
     * @param {number} userId the EventMonkey user id
     *
     * @returns {Promise<Genre[]>} the user ids in the friends list
     */
    async getFriendInterests(userId) {
        throw new Error('Unimplemented abstract function');
    }

    /* ********** EVENTS ********** */

    /**
     * Gets all the event ids from the backing data source.
     *
     * @returns {Promise<number[]>}
     * @abstract
     */
    async getAllEventIds() {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Adds event details to the backing data source.
     *
     * @param {Event} event the event to add
     *
     * @returns {Promise<number>} the id of the data source record
     * @abstract
     */
    async addEventDetails(event) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Removes event details from the backing data source.
     *
     * @param {number} eventId the id of the data source's event record
     *
     * @returns {Promise<void>}
     * @abstract
     */
    async removeEventDetails(eventId) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Adds associations between an event and an array of genres to the backing
     * data source. If any of the genres do not exist in the data source, they
     * will be added.
     *
     * @param {number} eventId the id of the data source's event record
     * @param {Genre[]} genres an array of genres
     *
     * @returns {Promise<Map<string, number>>} a map from genre name to the
     *     database's genre id
     * @abstract
     */
    async addGenresToEvent(eventId, genres) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Adds associations between an event and an array of images to the backing
     * data source. If any of the images do not exist in the data source, they
     * will be added.
     *
     * @param {number} eventId the id of the data source's event record
     * @param {Image[]} images an array of images
     *
     * @returns {Promise<Map<string, number>>} a map from image url to the
     *     database's image id
     * @abstract
     */
    async addImagesToEvent(eventId, images) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Gets the event details from the backing data source.
     *
     * @param {number} eventId the id of the data source's event record
     *
     * @returns {Promise<{
     *         name: string,
     *         description: string,
     *         location: string,
     *         dates: { startDateTime: Date, [endDateTime]: Date },
     *         priceRanges: { currency: string, min: number, max: number }[],
     *     }>}
     * @abstract
     */
    async getEventDetails(eventId) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Gets an array of {@link Genre}s associated to an {@link Event} by event
     * id.
     *
     * @param {number} eventId the id of the data source's event record
     *
     * @returns {Promise<Genre[]>}
     * @abstract
     */
    async getEventGenres(eventId) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Gets an array of {@link Image}s associated to an {@link Event} by event
     * id.
     *
     * @param {number} eventId the id of the data source's event record
     *
     * @returns {Promise<Image[]>}
     * @abstract
     */
    async getEventImages(eventId) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Gets an array of {@link Event}s which contain any genre with a name in
     * the {@link names} array.
     *
     * @param {string[]} names the genre names to collect events by
     *
     * @returns {Promise<number[]>} an array of event ids
     * @abstract
     */
    async getEventIdsWithGenres(names) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Gets an array of event ids which contain the search text in event name,
     * description, and genre names.
     *
     * @param {string} searchText the text to search for in the event details
     *
     * @returns {Promise<number[]>} the event ids
     * @abstract
     */
    async getEventIdsWithKeyword(searchText) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Adds a genre with the given name to the backing data source.
     *
     * @param {string} name the genre name
     *
     * @returns {Promise<Genre>} the constructed genre object with the id
     * @abstract
     */
    async addGenre(name) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Adds a list of genres using the given names to the backing data source.
     *
     * @param {string[]} names the genre name
     *
     * @returns {Promise<Genre[]>} the constructed genre objects with their id
     * @abstract
     */
    async addGenreList(names) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Gets a {@link Genre} from the EventMonkey database.
     *
     * @param {number} genreId the EventMonkey genre id
     *
     * @returns {Promise<Genre>} the constructed genre object with an id
     */
    async getGenre(genreId) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Gets an {@link Image} from the backing data source.
     *
     * @param {number} imageId the id of the data source's image record
     *
     * @returns {Promise<Image>} the constructed image object with an id
     * @abstract
     */
    async getImage(imageId) {
        throw new Error('Unimplemented abstract function');
    }
}

export class EventMonkeyDataSource extends DataSource {

    /* ********** USERS ********** */

    /**
     * Tests if an email already exists in the database.
     *
     * @param {string} email the email to check
     *
     * @returns {Promise<boolean>} `true` if the email is unique
     */
    async isEmailUnique(email) {
        const result = await Database.query(
            `SELECT COUNT(*) AS count
             FROM User
             WHERE email = ?
             GROUP BY email`,
            email
        );

        if (!result[0]) {
            // no results, no matching emails
            return true;
        }

        return result[0]['count'] === 0n;
    }

    /**
     * Tests if a username already exists in the database.
     *
     * @param {string} username the username to check
     *
     * @returns {Promise<boolean>} `true` if the username is unique
     */
    async isUsernameUnique(username) {
        const result = await Database.query(
            `SELECT COUNT(*) AS count
             FROM User
             WHERE username = ?
             GROUP BY username`,
            username
        );

        if (!result[0]) {
            // no results, no matching usernames
            return true;
        }

        return result[0]['count'] === 0n;
    }

    /**
     * Gets the login details (email, password, username) using the given email
     * from the database.
     *
     * @param {string} email the email to check
     *
     * @returns {Promise<{email: string, password: string, username: string}>}
     *     the login details
     */
    async getLoginDetails(email) {
        const result = await Database.query(
            `SELECT email, password, username
             FROM User
             WHERE email = ?`,
            email
        );

        if (!result[0]) {
            return undefined;
        }

        const password = result[0]['password'];
        const username = result[0]['username'];

        return {
            email,
            password,
            username
        };
    }

    /**
     * Adds user details to the database.
     *
     * @param {User} user the user to add
     *
     * @returns {Promise<number>} the id of the database record
     */
    async addUserDetails(user) {
        // insert user details to the User table
        const result = await Database.query(
            `INSERT INTO User(type, email, password, username, profile_image)
             VALUES (?, ?, ?, ?, ?)`, [
                user.type,
                user.email,
                user.password,
                user.username,
                user.profileImage ? user.profileImage.id : null
            ]
        );

        return result.insertId;
    }

    /**
     * Adds an association between an EventMonkey event and the user to the
     * database.
     *
     * @param {number} userId the EventMonkey user id
     * @param {number} eventId the EventMOnkey event id
     *
     * @returns {Promise<boolean>} `true` if the database added a record
     */
    async addToEventMonkeyList(userId, eventId) {
        // Attempt to insert the user-event id tuple to the EventMonkey event
        // list table. If an existing tuple exists, the insert will be ignored,
        // as the user already has the event in their event list.
        const result = await Database.query(
            `INSERT IGNORE INTO User_EM_Event_List(user_id, event_id)
             VALUES (?, ?)`,
            [userId, eventId]
        );

        // true if there was no existing record of the event in the user's list
        return result.affectedRows > 0;
    }

    /**
     * Removes an association between an EventMonkey event and the user from the
     * database.
     *
     * @param {number} userId the EventMonkey user id
     * @param {number} eventId the EventMonkey event id
     *
     * @returns {Promise<boolean>} `true` if the database removed a record
     */
    async removeFromEventMonkeyList(userId, eventId) {
        const result = await Database.query(
            `DELETE FROM User_EM_Event_List
             WHERE user_id = ? AND event_id = ?`,
            [userId, eventId]
        );
        return result.affectedRows > 0;
    }

    /**
     * Adds an association between a TicketMaster event and the user to the
     * database.
     *
     * @param {number} userId the EventMonkey user id
     * @param {string} eventId the EventMonkey event id
     *
     * @returns {Promise<boolean>} `true` if the database added a record
     */
    async addToTicketMasterList(userId, eventId) {
        // Attempt to insert the user-event id tuple to the TicketMaster event
        // list table. If an existing tuple exists, the insert will be ignored,
        // as the user already has the event in their event list.
        const result = await Database.query(
            `INSERT IGNORE INTO User_TM_Event_List(user_id, event_id)
             VALUES (?, ?)`,
            [userId, eventId]
        );

        // true if there was no existing record of the event in the user's list
        return result.affectedRows > 0;
    }

    /**
     * Removes an association between a TicketMaster event and the user from the
     * database.
     *
     * @param {number} userId the EventMonkey user id
     * @param {string} eventId the EventMonkey event id
     *
     * @returns {Promise<boolean>} `true` if the database removed a record
     */
    async removeFromTicketMasterList(userId, eventId) {
        const result = await Database.query(
            `DELETE FROM User_TM_Event_List
             WHERE user_id = ? AND event_id = ?`,
            [userId, eventId]
        );
        return result.affectedRows > 0;
    }

    /**
     * Adds a friend to the user's friends list.
     *
     * @param {number} userId the EventMonkey user id
     * @param {number} friendId the Event Monkey user id for the friend
     *     record
     *
     * @returns {Promise<boolean>} `true` if the attendee friend list table was
     *     modified as a result of this function call
     */
    async addToFriends(userId, friendId) {
        const result = await Database.query(
            `INSERT IGNORE INTO Attendee_Friend_List(user_id, friend_id)
             VALUES (?, ?)`,
            [userId, friendId]
        );

        return result.affectedRows > 0;
    }

    /**
     * Removes a friend from the user's friends list.
     *
     * @param {number} userId the EventMonkey user id
     * @param {number} friendId the Event Monkey user id for the friend
     *
     * @returns {Promise<boolean>} `true` if the attendee friend list table was
     *     modified as a result of this function call
     */
    async removeFromFriends(userId, friendId) {
        const result = await Database.query(
            `DELETE FROM Attendee_Friend_List
             WHERE user_id = ? AND friend_id = ?`,
            [userId, friendId]
        );

        return result.affectedRows > 0;
    }

    /**
     * Adds one or more genres to the user's interest list.
     *
     * @param {number} userId the EventMonkey user id
     * @param {number} genreId the genre id to add to interests
     *
     * @returns {Promise<void>}
     */
    async addToInterests(userId, genreId) {
        await Database.query(
            `INSERT IGNORE INTO Attendee_Interest_List(user_id, genre_id)
             VALUES (?, ?)`,
            [userId, genreId]
        );
    }

    /**
     * Removes one or more genres from the user's interest list.
     *
     * @param {number} userId the id of the data source's user record
     * @param {number} genreId the genre id to remove from interests
     *
     * @returns {Promise<void>}
     */
    async removeFromInterests(userId, genreId) {
        await Database.query(
            `DELETE FROM Attendee_Interest_List
             WHERE user_id = ? AND genre_id = ?`,
            [userId, genreId]
        );
    }

    /**
     * Gets the user details from the backing data source.
     *
     * @param {number} userId the EventMonkey user id
     *
     * @returns {Promise<{
     *         type: string,
     *         email: string,
     *         password: string,
     *         username: string,
     *         profileImageId: number
     *     }>}
     */
    async getUserDetails(userId) {
        const result = await Database.query(
            `SELECT type, email, password, username, profile_image
             FROM User WHERE user_id = ?`,
            userId
        );

        let type = undefined;
        let email = undefined;
        let password = undefined;
        let username = undefined;
        let profileImageId = undefined;

        if (result[0]) {
            type = result[0]['type'];
            email = result[0]['email'];
            password = result[0]['password'];
            username = result[0]['username'];
            profileImageId = result[0]['profile_image'];
        }

        return { type, email, password, username, profileImageId };
    }

    /**
     * Gets the event ids stored in a user's EventMonkey event list.
     *
     * @param {number} userId
     *
     * @returns {Promise<number[]>} an array of event ids
     */
    async getEventMonkeyList(userId) {
        // search the database using the EventMonkey event list
        const result = await Database.query(
            `SELECT list.event_id
             FROM User_EM_Event_List list
             WHERE list.user_id = ?`,
            userId
        );

        // transform the database row results into an array of event ids
        return result.map(row => row['event_id']);
    }

    /**
     * Gets the event ids stored in a user's TicketMaster event list.
     *
     * @param {number} userId
     *
     * @returns {Promise<number[]>} an array of event ids
     */
    async getTicketMasterList(userId) {
        // search the database using the TicketMaster event list
        const result = await Database.query(
            `SELECT list.event_id
             FROM User_TM_Event_List list
             WHERE list.user_id = ?`,
            userId
        );

        // transform the database row results into an array of event ids
        return result.map(row => row['event_id']);
    }

    /**
     * Gets the genre list that the user has added as their interests.
     *
     * @param {number} userId the EventMonkey user id
     *
     * @returns {Promise<Genre[]>}
     */
    async getInterestList(userId) {
        const result = await Database.query(
            `SELECT ail.genre_id, genre.name
             FROM Attendee_Interest_List ail
             INNER JOIN Genre genre
                USING (genre_id)
             WHERE ail.user_id = ?`,
            userId
        );

        return result.map(row => {
            return Genre.createWithId(row['genre_id'], row['name']);
        });
    }

    /**
     * Gets an array of user ids list that the user has added to their friends
     * list.
     *
     * @param {number} userId the EventMonkey user id
     *
     * @returns {Promise<number[]>} the user ids in the friends list
     */
    async getFriendList(userId) {
        const result = await Database.query(
            `SELECT friend_id
             FROM Attendee_Friend_List
             WHERE user_id = ?`,
            userId
        );

        if (!result[0]) {
            return [];
        }

        return result.map(row => row['friend_id']);
    }

    /**
     * Gets a unique array of genres using an attendee's friends list. The genre
     * names are fetched from each user in the friends list and combined
     * into one array.
     *
     * @param {number} userId the EventMonkey user id
     *
     * @returns {Promise<number[]>} the user ids in the friends list
     */
    async getFriendInterests(userId) {
        // get a distinct list of genre ids from each user in the friends list
        const result = await Database.query(
            `SELECT DISTINCT ail.genre_id
             FROM Attendee_Friend_List afl
             INNER JOIN Attendee_Interest_List ail
                ON ail.user_id = afl.friend_id
             WHERE afl.user_id = ?`,
            userId
        );

        if (!result[0]) {
            // either no friends in the friends list, or no friend has interests
            return [];
        }

        // construct all the Genre objects using the resulting genre ids
        return await Promise.all(
            result.map(row => this.getGenre(row['genre_id']))
        );
    }

    /* ********** EVENTS ********** */

    /**
     * Gets all the event ids from the backing data source.
     *
     * @returns {Promise<number[]>}
     */
    async getAllEventIds() {
        const result = await Database.query('SELECT event_id FROM Event');
        return result.map(row => row['event_id']);
    }

    /**
     * Adds event details to the database.
     *
     * @param {Event} event the event to add
     *
     * @returns {Promise<number>} the id of the database record
     */
    async addEventDetails(event) {
        // helper function to transform undefined fields into null values
        const nullable = value => value === undefined ? null : value;

        // insert event details to the Event table
        const result = await Database.query(
            `INSERT INTO Event(name, description, location, dates, price_ranges)
             VALUES (?, ?, ?, ?, ?)`, [
                event.name,
                nullable(event.description),
                event.location,
                nullable(JSON.stringify(event.dates)),
                nullable(JSON.stringify(event.priceRanges))
            ]
        );

        return result.insertId;
    }

    /**
     * Removes event details from the database.
     *
     * @param {number} eventId the EventMonkey event id
     *
     * @returns {Promise<void>}
     */
    async removeEventDetails(eventId) {
        // deleting the event id from the database will also cascade to deleting
        // events in the Event_Genre_List, Event_Image_List, User_EM_Event_List,
        // and User_TM_Event_List tables
        await Database.query(
            `DELETE FROM Event
             WHERE event_id = ?`,
            eventId
        );
    }

    /**
     * Adds associations between an event and an array of genres to the
     * database. If any of the genres do not exist in the database, they will
     * be added.
     *
     * @param {number} eventId the EventMonkey event id
     * @param {Genre[]} genres an array of genres
     *
     * @returns {Promise<Map<string, number>>} a map from genre name to the
     *     database's genre id
     */
    async addGenresToEvent(eventId, genres) {
        if (genres.length === 0) {
            // no genres to insert
            return new Map();
        }

        // add all genres to ensure they exist in the database
        const genreNames = genres.map(genre => genre.name);
        const genreNameToId = await this.addGenreBatch_(genreNames);

        // transform the map to an array of genre ids
        const genreIds = [];
        genreNameToId.forEach(genreId => {
            genreIds.push(genreId);
        });

        // the genres are guaranteed to exist at this point, so create an
        // association between the event and the genre
        await Database.batch(
            `INSERT IGNORE INTO Event_Genre_List(event_id, genre_id)
             VALUES (?, ?)`,
            genreIds.map(genreId => [eventId, genreId])
        );

        return genreNameToId;
    }

    /**
     * Adds associations between an event and an array of images to the
     * database. If any of the images do not exist in the database, they
     * will be added.
     *
     * @param {number} eventId the EventMonkey event id
     * @param {Image[]} images an array of images
     *
     * @returns {Promise<Map<string, number>>} a map from image url to the
     *     database's image id
     */
    async addImagesToEvent(eventId, images) {
        if (images.length === 0) {
            // no images to insert
            return new Map();
        }

        // add all images to ensure they exist in the database
        const imageUrlToId = await this.addImageBatch_(images);

        // transform the map to an array of image ids
        const imageIds = [];
        imageUrlToId.forEach(imageId => {
            imageIds.push(imageId);
        });

        // the images are guaranteed to exist at this point, so create an
        // association between the event and the genre
        await Database.batch(
            `INSERT IGNORE INTO Event_Image_List(event_id, image_id)
             VALUES (?, ?)`,
            imageIds.map(imageId => [eventId, imageId])
        );

        return imageUrlToId;
    }

    /**
     * Gets the event details from the EventMonkey database.
     *
     * @param {number} eventId the id of the data source's event record
     *
     * @returns {Promise<
     *     undefined | {
     *         name: string,
     *         description: string,
     *         location: string,
     *         dates: { startDateTime: Date, [endDateTime]: Date },
     *         priceRanges: { currency: string, min: number, max: number }[],
     *     }>}
     */
    async getEventDetails(eventId) {
        const result = await Database.query(
            `SELECT name, description, location, dates, price_ranges
             FROM Event
             WHERE event_id = ?`,
            eventId
        );

        if (!result[0]) {
            return undefined;
        }

        const name = result[0]['name'];
        const description = result[0]['description'];
        const location = result[0]['location'];
        const dates = JSON.parse(result[0]['dates']);
        let priceRanges = [];

        const priceRangesText = result[0]['price_ranges'];

        // price ranges is nullable, so make sure it exists before reading
        if (priceRangesText) {
            priceRanges = JSON.parse(priceRangesText);
        }

        return {
            name,
            description,
            location,
            dates,
            priceRanges
        }
    }

    /**
     * Gets an array of {@link Genre}s associated to an {@link Event} by event
     * id.
     *
     * @param {number} eventId the EventMonkey event id
     *
     * @returns {Promise<Genre[]>}
     */
    async getEventGenres(eventId) {
        const result = await Database.query(
            `SELECT genre.genre_id, genre.name
             FROM Event_Genre_List egl
             INNER JOIN Genre genre
                USING (genre_id)
             WHERE egl.event_id = ?`,
            eventId
        );

        // convert the resulting json row array into an array of Genre
        return result.map(row => {
            return Genre.createWithId(row['genre_id'], row['name']);
        });
    }

    /**
     * Gets an array of {@link Image}s associated to an {@link Event} by event
     * id.
     *
     * @param {number} eventId the EventMonkey event id
     *
     * @returns {Promise<Image[]>}
     */
    async getEventImages(eventId) {
        const imageRows = await Database.query(
            `SELECT img.image_id, img.ratio, img.width, img.height, img.url
             FROM Event_Image_List eil
             INNER JOIN Image img
                USING (image_id)
             WHERE eil.event_id = ?`,
            eventId
        );

        // convert the resulting json row array into an array of Image
        return imageRows.map(row => {
            return Image.createWithId(
                row['image_id'],
                row['ratio'],
                row['width'],
                row['height'],
                row['url']
            );
        });
    }

    /**
     * Gets an array of {@link Event}s which contain any genre with a name in
     * the {@link names} array.
     *
     * @param {string[]} names the genre names to collect events by
     *
     * @returns {Promise<number[]>} an array of event ids
     */
    async getEventIdsWithGenres(names) {
        // the database is queried by giving a json array of strings as genre
        // name inputs, and the resulting rows are an array of event_ids
        const result = await Database.query(
            `SELECT DISTINCT egl.event_id
             FROM Event_Genre_List egl
             INNER JOIN Genre genre
                USING (genre_id)
             WHERE JSON_CONTAINS(LOWER(?), JSON_QUOTE(LOWER(genre.name)))`,
            JSON.stringify(names)
        );

        // extract an array of the event ids from the query result
        return result.map(row => row['event_id']);
    }

    /**
     * Gets an array of event ids which contain the search text in event name,
     * description, and genre names.
     *
     * @param {string} searchText the text to search for in the event details
     *
     * @returns {Promise<number[]>} the event ids
     */
    async getEventIdsWithKeyword(searchText) {
        // this query will try and match the search text with the event title,
        // name and genre names
        const result = await Database.query(
            `SELECT event.event_id
             FROM Event event
             WHERE MATCH(event.name, event.description) AGAINST (?)
             UNION DISTINCT
             SELECT egl.event_id
             FROM Event_Genre_List egl
             INNER JOIN Genre genre
                USING (genre_id)
             WHERE MATCH(genre.name) AGAINST (?)`,
            [searchText, searchText]
        );

        // extract an array of the event ids from the query result
        return result.map(row => row['event_id']);
    }

    /**
     * Adds a genre with the given name to the backing data source.
     *
     * @param {string} name the genre name
     *
     * @returns {Promise<Genre>} the constructed genre object with the id
     */
    async addGenre(name) {
        // insert the genre name to the database. If the genre name already
        // exists, this insert will be ignored
        const result = await Database.query(
            `INSERT IGNORE INTO Genre(name)
             VALUES (?)`,
            name
        );

        if (result.affectedRows < 1) {
            // no genre was inserted
            return undefined;
        }

        return Genre.createWithId(result.insertId, name);
    }

    /**
     * Adds a list of genres using the given names to the backing data source.
     *
     * @param {string[]} names the genre name
     *
     * @returns {Promise<Genre[]>} the constructed genre objects with their id
     */
    async addGenreList(names) {
        if (names.length === 0) {
            return [];
        }

        if (names.length === 1) {
            return [await this.addGenre(names[0])];
        }

        const nameToId = await this.addGenreBatch_(names);

        // create an array of Genre objects with the id and name
        const genres = [];
        nameToId.forEach((id, name) => {
            genres.push(Genre.createWithId(id, name));
        });

        return genres;
    }

    /**
     * Gets a {@link Genre} from the EventMonkey database.
     *
     * @param {number} genreId the EventMonkey genre id
     *
     * @returns {Promise<Genre>} the constructed genre object with an id
     */
    async getGenre(genreId) {
        const result = await Database.query(
            `SELECT name
             FROM Genre
             WHERE genre_id = ?`,
            genreId
        );

        if (!result[0]) {
            return undefined;
        }

        return Genre.createWithId(genreId, result[0]['name']);
    }

    /**
     * Gets an {@link Image} from the EventMonkey database.
     *
     * @param {number} imageId the EventMonkey image id
     *
     * @returns {Promise<Image>} the constructed image object with an id
     */
    async getImage(imageId) {
        const result = await Database.query(
            `SELECT ratio, width, height, url
             FROM Image
             WHERE image_id = ?`,
            imageId
        );

        if (!result[0]) {
            return undefined;
        }

        const ratio = result[0]['ratio'];
        const width = result[0]['width'];
        const height = result[0]['height'];
        const url = result[0]['url'];
        return Image.createWithId(imageId, ratio, width, height, url);
    }

    /**
     * Add multiple genres to the database all at once. This is preferable to
     * flooding the database pool connections by instead batching all inserts
     * into one query call.
     *
     * @param {string[]} names an array of genre names to add
     *
     * @returns {Promise<Map<string, number>>} the genre name to id map
     * @private
     */
    async addGenreBatch_(names) {
        // batch insert the list of genre names to the database. Any existing
        // genres with the same name will be ignored
        await Database.batch(
            `INSERT IGNORE INTO Genre(name)
             VALUES (?)`,
            names
        );

        // fetch all the genre id-name tuples in the database matching any name
        // in the 'names' array
        const result = await Database.query(
            `SELECT genre.genre_id, genre.name
             FROM Genre genre
             WHERE JSON_CONTAINS(LOWER(?), JSON_QUOTE(LOWER(genre.name)))`,
            JSON.stringify(names)
        );

        // create a map from genre name to the database's generated genre id
        const genreNameToId = new Map();
        for (const row of result) {
            genreNameToId.set(row['name'], row['genre_id']);
        }
        return genreNameToId;
    }

    /**
     *
     * Add multiple images to the database all at once. This is preferable to
     * flooding the database pool connections by instead batching all inserts
     * into one query call.
     *
     * @param {Image[]} images an array of images to add
     *
     * @returns {Promise<Map<string, number>>} the image url to id map
     * @private
     */
    async addImageBatch_(images) {
        // batch insert the image details to the database. If a URL already
        // exists in the image table, then that image will be ignored
        await Database.batch(
            `INSERT IGNORE INTO Image(ratio, width, height, url)
             VALUES (?, ?, ?, ?)`,
            images.map(img => {
                return [img.ratio, img.width, img.height, img.url];
            })
        );

        // transform the image array to an array of image urls
        const imageUrls = images.map(image => image.url);

        // each image is constrained to have a unique url which will be used to
        // select the matching image ids
        const result = await Database.query(
            `SELECT image.image_id, image.url
             FROM Image image
             WHERE JSON_CONTAINS(LOWER(?), JSON_QUOTE(LOWER(image.url)))`,
            JSON.stringify(imageUrls)
        );

        // create a map from image url to the database's generated image id
        const imageMap = new Map();
        for (const row of result) {
            imageMap.set(row['url'], row['image_id']);
        }
        return imageMap;
    }
}

/**
 * A singleton for the EventMonkey using a backing database data source.
 *
 * @type {EventMonkeyDataSource}
 */
export const emDBSource = new EventMonkeyDataSource();

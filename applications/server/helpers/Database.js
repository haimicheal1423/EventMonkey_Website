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

export class DataSource {

    constructor() {
        if (this.constructor === DataSource) {
            throw new Error('Cannot instantiate abstract class');
        }
    }

    /* ********** USERS ********** */

    /**
     * Adds user details to the backing data source.
     *
     * @param {User} user the user to add
     *
     * @returns {Promise<number>} the id of the data source record
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
     */
    async removeFromEventMonkeyList(userId, eventId) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Adds an association between a TicketMaster event and the user to the
     * backing data source.
     *
     * @param {number} user the id of the data source's user record
     * @param {number} event the id of the data source's event record
     *
     * @returns {Promise<boolean>} `true` if the data source added a record
     */
    async addToTicketMasterList(user, event) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Removes an association between a TicketMaster event and the user from the
     * backing data source.
     *
     * @param {number} userId the id of the data source's user record
     * @param {number} eventId the id of the data source's event record
     *
     * @returns {Promise<boolean>} `true` if the data source removed a record
     */
    async removeFromTicketMasterList(userId, eventId) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Adds one or more genres to the user's interest list.
     *
     * @param {number} userId the id of the data source's user record
     * @param {...Genre} genres the genres to add as interests
     *
     * @returns {Promise<void>}
     */
    async addInterest(userId, ...genres) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Removes one or more genres from the user's interest list.
     *
     * @param {number} userId the id of the data source's user record
     * @param {...Genre} genres the genres to remove from interests
     *
     * @returns {Promise<void>}
     */
    async removeInterest(userId, ...genres) {
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
     */
    async getInterestList(userId) {
        throw new Error('Unimplemented abstract function');
    }

    /* ********** EVENTS ********** */

    /**
     * Gets all the event ids from the backing data source.
     *
     * @returns {Promise<number[]>}
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
     */
    async getEventIdsWithKeyword(searchText) {
        throw new Error('Unimplemented abstract function');
    }
}

export class EventMonkeyDataSource extends DataSource {

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
        const genreNameToId = await this.addGenreBatch_(genres);

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
     * @param {number} eventId the EventMonkey event id
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
     * @param {number} eventId the EventMonkey event id
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
     * Adds one or more genres to the user's interest list.
     *
     * @param {number} userId the EventMonkey user id
     * @param {...Genre} genres the genres to add as interests
     *
     * @returns {Promise<void>}
     */
    async addInterest(userId, ...genres) {
        // ensures all the genres exist in the database
        const nameToId = await this.addGenreBatch_(genres);

        // create a genre id array instead of mutating the genre objects
        const genreIds = [];
        genres.forEach(genre => {
            genreIds.push(nameToId.get(genre.name));
        });

        // batch insert all the genre ids to the user's interest list
        await Database.batch(
            `INSERT IGNORE INTO Attendee_Interest_List(user_id, genre_id)
             VALUES (?, ?)`,
            genreIds.map(genreId => [userId, genreId])
        );
    }

    /**
     * Removes one or more genres from the user's interest list.
     *
     * @param {number} userId the id of the data source's user record
     * @param {...Genre} genres the genres to remove from interests
     *
     * @returns {Promise<void>}
     */
    async removeInterest(userId, ...genres) {
        const names = genres.map(genre => genre.name);

        // find all the genre ids which match any name in the genres array
        const result = await Database.query(
            `SELECT genre.genre_id
             FROM Genre genre
             WHERE JSON_CONTAINS(LOWER(?), JSON_QUOTE(LOWER(genre.name)))`,
            JSON.stringify(names)
        );

        // extract a genre id array from the database result
        const genreIds = result.map(row => row['genre_id']);

        // batch delete all existing genre ids found from the genre names
        await Database.batch(
            `DELETE FROM Attendee_Interest_List
             WHERE user_id = ? AND genre_id = ?`,
            genreIds.map(genreId => [userId, genreId])
        );
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
     * Gets the event details from the EventMonkey database.
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
     */
    async getEventDetails(eventId) {
        const result = await Database.query(
            `SELECT name, description, location, dates, price_ranges
             FROM Event
             WHERE event_id = ?`,
            eventId
        );

        let name = undefined;
        let description = undefined;
        let location = undefined;
        let dates = undefined;
        let priceRanges = [];

        if (result[0]) {
            name = result[0]['name'];
            description = result[0]['description'];
            location = result[0]['location'];

            dates = JSON.parse(result[0]['dates']);

            const priceRangesText = result[0]['price_ranges'];

            // price ranges is nullable, so make sure it exists before reading
            if (priceRangesText) {
                priceRanges = JSON.parse(priceRangesText);
            }
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
            `SELECT DISTINCT egl.event_id
             FROM Event event
             INNER JOIN Event_Genre_List egl
                USING (event_id)
             INNER JOIN Genre genre
                USING (genre_id)
             WHERE MATCH(event.name, event.description) AGAINST (?)
                OR MATCH(genre.name) AGAINST (?)`,
            [searchText, searchText]
        );

        // extract an array of the event ids from the query result
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
     * Add multiple genres to the database all at once. This is preferable to
     * flooding the database pool connections by instead batching all inserts
     * into one query call.
     *
     * @param {Genre[]} genres an array of genres to add
     *
     * @returns {Promise<Map<string, number>>} the genre name to id map
     * @private
     */
    async addGenreBatch_(genres) {
        const names = genres.map(genre => genre.name);

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

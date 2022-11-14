import fetch from 'node-fetch';

import { SOURCE_EVENT_MONKEY, SOURCE_TICKET_MASTER, Event } from '../models/Event.js';
import { Image } from '../models/Image.js';
import { Genre } from '../models/Genre.js';
import { Database } from './Database.js';

/**
 * An interface to access event details from some data source (HTTP, databases,
 * files, etc.)
 *
 * @abstract
 */
export class EventSource {

    /**
     * Throws an error when constructing a new {@link EventSource} since it is
     * an abstract class.
     *
     * @throws {Error} cannot instantiate abstract class
     */
    constructor() {
        if (this.constructor === EventSource) {
            throw new Error('Cannot instantiate abstract class');
        }
    }

    /**
     * Finds a single {@link Event} by matching the given event id.
     *
     * @param {number} eventId the EventMonkey event id
     *
     * @returns {Promise<Event>} the event
     * @abstract
     */
    findByEventId(eventId) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Finds a list of {@link Event}s by an array of genre names. The genre
     * names are case-insensitive.
     *
     * @param {string[]} names an array of genre names
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<Event[]>} a list of events
     * @abstract
     */
    findByGenre(names, limit) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Finds a list of {@link Event}s using a keyword to search with.
     *
     * @param {string} searchText the keyword to search with
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<Event[]>} a list of events
     * @abstract
     */
    findByKeyword(searchText, limit) {
        throw new Error('Unimplemented abstract function');
    }
}

/**
 * An implementation of {@link EventSource} which sources {@link Event} details
 * through the TicketMaster api using the HTTP protocol.
 */
export class TicketMasterSource extends EventSource {

    /**
     * Fetches a response from a URL. Query parameters can be added to the base
     * URL by populating key-value pairs in the `values` object. For
     * example,
     *
     * ```
     *     apiRequest_('http://api.request.com', {
     *         apikey: 'someApiKey',
     *         key1: val1,
     *         key2: val2
     *     })
     * ```
     *
     * would result in fetching from the URL:
     *
     * ```
     *     'http://api.request.com?apikey=someApiKey&key1=val1&key2=val2'
     * ```
     *
     * @param {string} baseUrl the URL to a specific api resource
     * @param {Object} values optional query parameters to attach to the base
     *     URL; default value is an empty JSON object
     *
     * @returns {Promise<Response>}
     * @private
     */
    apiRequest_(baseUrl, values = {}) {
        const entries = Object.entries(values);

        if (entries.length === 0) {
            // default empty values object can just fetch using the base url
            return fetch(baseUrl);
        }

        // convert the key-value entries into a param string in the form
        // key1=val1&key2=val2...&keyN=valN
        const params = entries
            .map(([key, val]) => `${key}=${val}`)
            .join('&');

        // join the url with query parameters in the form
        // baseUrl?key1=val1&key2=val2...&keyN=valN
        return fetch(`${baseUrl}?${params}`);
    }

    /**
     * Fetch an array of {@link Event}s by sending a request to the TicketMaster
     * api with optional parameter values.
     *
     * @param values values to append as a query string when creating the api
     *     request
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<Event[]>}
     * @private
     */
    async ticketMasterEventRequest_(values = {}, limit) {
        // make an api request using the events url and api key, then spread out
        // the optional query parameters
        const response = await this.apiRequest_(
            'https://app.ticketmaster.com/discovery/v2/events',
            { apikey: process.env.TICKETMASTER_API_KEY, ...values }
        );

        const json = await response.json()

        if (!json['_embedded']) {
            // response does not contain _embedded data
            return [];
        }

        const events = json['_embedded']['events'];

        if (!events) {
            // _embedded data does not contain events
            return [];
        }

        // trim the events list to the limit
        events.length = Math.min(events.length, limit);
        return events.map(eventObj => this.constructEvent_(eventObj));
    }

    /**
     * Constructs a new {@link Event} using details extracted from the
     * TicketMaster api response object.
     *
     * @param eventObj the TicketMaster event response as a json object
     *
     * @returns {Event} an EventMonkey event object
     * @private
     */
    constructEvent_(eventObj) {
        function constructPriceRange(priceRanges) {
            /*
             * a map to keep track of possible price ranges with the same
             * currency type. Duplicate currency types must be reduced to one
             * object and update the current mapped value
             */
            const rangeMap = new Map();

            for (const nextPriceRange of priceRanges) {
                const { currency, min: nextMin, max: nextMax }
                    = nextPriceRange;

                if (rangeMap.has(currency)) {
                    const obj = rangeMap.get(currency);

                    // update the price range for the mapped currency type
                    obj.min = Math.min(obj.min, nextMin);
                    obj.max = Math.max(obj.max, nextMax);
                } else {
                    // no mapping for currency type yet
                    rangeMap.set(currency,
                        {
                            currency: currency,
                            min: nextMin,
                            max: nextMax
                        });
                }
            }

            // the 'currency' keys can be dropped and only keep the values array
            // of price ranges, each with a unique currency type
            return Object.values(rangeMap);
        }

        // sometimes TicketMaster event properties are undefined, so try and
        // find the best information to fill in
        const description = eventObj['description']
            || eventObj['info']
            || eventObj['pleaseNote']
            || 'No description available';

        const location = 'No location available';

        const date = {
            startDateTime: new Date(eventObj['dates']['start']['dateTime'])
        };

        if (eventObj['dates']['end']) {
            date.endDateTime = new Date(eventObj['dates']['end']['dateTime']);
        }

        // not all TicketMaster events have defined price ranges
        const priceRange = constructPriceRange(eventObj['priceRanges'] || []);

        const images = eventObj['images'].map(image => {
            const { ratio, width, height, url } = image;
            return Image.create(ratio, width, height, url);
        });

        // a set to ensure genre names are unique
        const genreSet = new Set();

        if (eventObj['classifications']) {
            // events with multiple classifications have a lot of overlapping
            // genres and repeated genres inside of classifications themselves
            eventObj['classifications'].forEach(classObj => {
                if (classObj['segment'] && classObj['segment']['name']) {
                    genreSet.add(classObj['segment']['name']);
                }
                if (classObj['genre'] && classObj['genre']['name']) {
                    genreSet.add(classObj['genre']['name']);
                }
                if (classObj['subGenre'] && classObj['subGenre']['name']) {
                    genreSet.add(classObj['subGenre']['name']);
                }
            });
        }

        const genres = Array.from(genreSet).map(name => {
            return Genre.create(name);
        });

        const event = new Event(
            // all events fetched from this source belong to TicketMaster
            SOURCE_TICKET_MASTER,
            eventObj['name'],
            description,
            location,
            date,
            priceRange,
            images,
            genres
        );

        event.id = eventObj['id'];
        return event;
    }

    /**
     * Finds a single {@link Event} by matching the given event id.
     *
     * @param {number} eventId the EventMonkey event id
     *
     * @returns {Promise<Event>} the event
     */
    async findByEventId(eventId) {
        return this.ticketMasterEventRequest_({
            id: eventId,
            size: 1
        }, 1);
    }

    /**
     * Finds a list of {@link Event}s by an array of genre names. The genre
     * names are case-insensitive.
     *
     * @param {string[]} names an array of genre names
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<Event[]>} a list of events
     */
    async findByGenre(names, limit) {
        return this.ticketMasterEventRequest_({
            classificationName: names,
            size: limit
        }, limit);
    }

    /**
     * Finds a list of {@link Event}s using a keyword to search with.
     *
     * @param {string} searchText the keyword to search with
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<Event[]>} a list of events
     */
    async findByKeyword(searchText, limit) {
        return this.ticketMasterEventRequest_({
            keyword: searchText,
            size: limit
        }, limit);
    }
}

/**
 * An implementation of {@link EventSource} which sources {@link Event} details
 * from a sql database.
 */
export class EventMonkeySource extends EventSource {

    /**
     * Adds an event to the database. The images and genres inside the event
     * object will also be added to the database if they do not exist. Event id
     * and genre/image ids will be populated with existing database values.
     *
     * @param {Event} event the event to add
     * @param {function(any): void} callback a function which will be called after the database query finishes executing
     *
     * @returns {Promise<void>}
     * @private
     */
    async addEvent_(event, callback) {
        const result = await Database.query(
            `INSERT INTO Event(name, description, location, dates, price_ranges)
             VALUES (?, ?, ?, ?, ?)`, [
                event.name,
                event.description,
                event.location,
                JSON.stringify(event.priceRanges),
                JSON.stringify(event.dates)
            ]
        );

        if (result.affectedRows > 0) {
            // add any new genres or images to the database, existing ones will
            // be ignored
            await Promise.all([
                this.addGenres_(event.genres),
                this.addImages_(event.images)
            ]);
        }

        if (callback) {
            callback(result);
        }
    }

    /**
     * Removes an event from the database. This will not remove any images or
     * genres from the database, although it will remove the associations.
     *
     * @param event the event to remove
     *
     * @returns {Promise<*>}
     * @private
     */
    async removeEvent_(event) {
        // this will also remove any genres/images in the event genre/image list
        // tables as well as the event list table
        return Database.query(
            `DELETE FROM Event
             WHERE event_id = ?`,
            event.id
        );
    }

    /**
     * Associates an {@link Event} to a {@link User} by adding an entry in the
     * `Event_List` table. The user id can be either 'attendee' or
     * 'organizer'.
     *
     * @param {number} eventId the EventMonkey event id
     * @param {number} userId the EventMonkey user id to associate with the
     *     event
     *
     * @returns {Promise<*>}
     * @private
     */
    async addToEventList_(eventId, userId) {
        return Database.query(
            `INSERT IGNORE INTO Event_List(user_id, event_id)
             VALUES (?, ?)`,
            [userId, eventId]
        );
    }

    /**
     * Removes an event from the Event_List database table. This will not
     * remove the event itself, but will remove the association with a
     * {@link User}.
     *
     * @param {Event} event the event
     * @param {User} user the user associated with the event
     *
     * @returns {Promise<*>}
     * @private
     */
    async removeFromEventList_(event, user) {
        return Database.query(
            `DELETE FROM Event_List
             WHERE user_id = ? AND event_id = ?`,
            [user.id, event.id]
        );
    }

    /**
     * Associates a {@link Genre} to an {@link Event} by adding an entry in the
     * `Event_Genre_List` table.
     *
     * @param {Event} event the event
     * @param {Genre} genre the genre to associate with the event
     *
     * @returns {Promise<*>}
     * @private
     */
    async addGenreToEventList_(event, genre) {
        return Database.query(
            `INSERT IGNORE INTO Event_Genre_List(event_id, genre_id)
             VALUES (?, ?)`,
            [event.id, genre.id]
        );
    }

    /**
     * Removes a genre from the Event_Genre_List database table. This will not
     * remove the genre itself, but will remove the association with an
     * {@link Event}.
     *
     * @param {Event} event the genre's event
     * @param {Genre} genre the genre to remove
     *
     * @returns {Promise<*>}
     * @private
     */
    async removeGenreFromEventList_(event, genre) {
        return Database.query(
            `DELETE FROM Event_Genre_List
             WHERE event_id = ? AND  genre_id = ?`,
            [event.id, genre.id]
        );
    }

    /**
     * Associates an {@link Image} to an {@link Event} by adding an entry in the
     * `Event_Image_List` table.
     *
     * @param {Event} event the event
     * @param {Image} image the image to associate with the event
     *
     * @returns {Promise<*>}
     * @private
     */
    async addImageToEventList_(event, image) {
        return Database.query(
            `INSERT IGNORE INTO Event_Image_List(event_id, image_id)
             VALUES (?, ?)`,
            [event.id, image.id]
        );
    }

    /**
     * Removes an image from the Event_Image_List database table. This will not
     * remove the image itself, but will remove the association with an
     * {@link Event}.
     *
     * @param {Event} event the image's event
     * @param {Genre} image the image to remove
     *
     * @returns {Promise<*>}
     * @private
     */
    async removeImageFromEventList_(event, image) {
        return Database.query(
            `DELETE FROM Event_Image_List
             WHERE event_id = ? AND  image_id = ?`,
            [event.id, image.id]
        );
    }

    /**
     * Adds a list of {@link Genre} objects to the database. Any existing genre
     * in the database with the same name will be skipped. The genre id will be
     * set by whatever the database insert id is, or the current genre id if the
     * genre already exists.
     *
     * @param {Genre[]} genres the genres to add
     *
     * @returns {Promise<void>}
     * @private
     */
    async addGenres_(genres) {
        if (!genres || genres.length === 0) {
            // no genres to add!
            return;
        }

        // first, try and add all genres to the database
        await Promise.all(
            genres.map(async genre => {
                const result = await Database.query(
                    `INSERT IGNORE INTO Genre(name)
                     VALUES (?)`,
                    genre.name
                );

                if (result.affectedRows > 0) {
                    // genre did not exist in the database so set this genre id
                    genre.id = result.insertId;
                }
            })
        );

        // second, find all existing genre ids that did not get set from the
        // first step
        await Promise.all(
            genres.filter(genre => genre.id === undefined)
                .map(async genre => {
                    const result = await Database.query(
                        `SELECT genre.genre_id
                         FROM Genre genre
                         WHERE genre.name = ?`,
                        genre.name
                    );

                    if (result[0]) {
                        // genre was found, so set the genre id
                        genre.id = result[0]["genre_id"];
                    }
                })
        );

        // TODO: batched inserts require creative solution to map inserted ids
        //       to genres
        // await Database.batch(
        //     `INSERT IGNORE INTO Genre(name)
        //      VALUES (?)`,
        //     genres.map(genre => [genre.name])
        // );
    }

    /**
     * Adds a list of {@link Image} objects to the database. Any existing image
     * in the database with the same url will be skipped. The image id will be
     * set by whatever the database insert id is, or the current image id if the
     * image already exists.
     *
     * @param {Image[]} images the images to add
     *
     * @returns {Promise<void>}
     * @private
     */
    async addImages_(images) {
        if (!images || images.length === 0) {
            // no images to add!
            return;
        }

        // first, try and add all images to the database
        await Promise.all(
            images.map(async image => {
                const result = await Database.query(
                    `INSERT IGNORE INTO Image(ratio, width, height, url)
                     VALUES (?, ?, ?, ?)`,
                    [image.ratio, image.width, image.height, image.url]
                );

                if (result.affectedRows > 0) {
                    // image did not exist in the database so set this image id
                    image.id = result.insertId;
                }
            })
        );

        // second, find all existing image ids that did not get set from the
        // first step
        await Promise.all(
            images.filter(image => image.id === undefined)
                .map(async image => {
                    const result = await Database.query(
                        `SELECT image.image_id
                         FROM Image image
                         WHERE image.url = ?`,
                        image.url
                    );

                    if (result[0]) {
                        // image was found, so set the image id
                        image.id = result[0]["image_id"];
                    }
                })
        );

        // TODO: batched inserts require creative solution to map inserted ids
        //       to images
        // const result = await Database.batch(
        //     `INSERT IGNORE INTO Image(ratio, width, height, url)
        //      VALUES (?, ?, ?, ?)`,
        //     images.map(img => [img.ratio, img.width, img.height, img.url])
        // );
    }

    /**
     * Create an event by inserting it into the database. The event id will get
     * set if the insert operation was successful, and the event will be
     * assigned to the organizer.
     *
     * @param {number} organizerId the EventMonkey user id of the event owner
     * @param {Event} event the event to insert into the database
     *
     * @returns {Promise<void>}
     */
    async createEvent(organizerId, event) {
        // add the event to the Event table, and set the event id to the
        // generated id
        await this.addEvent_(event, result => {
            if (result.affectedRows > 0) {
                // set the event id to the generated database id
                event.id = result.insertId;
            }
        });

        if (!event.id) {
            // event was not added to the database
            return;
        }

        // once the event is added to the table, add the event to the organizer
        // event list, add the genres to the event genres list, and add the
        // images to the event images list asynchronously
        await Promise.all([
            this.addToEventList_(event.id, organizerId),
            event.genres.map(genre => this.addGenreToEventList_(event, genre)),
            event.images.map(image => this.addImageToEventList_(event, image))
        ]);
    }

    /**
     * Finds all events owned by a specific user.
     *
     * @param userId the EventMonkey id of the user
     *
     * @returns {Promise<Event[]>}
     */
    async findByUserId(userId) {
        const eventRows = await Database.query(
            `SELECT el.event_id
             FROM Event_List el
             WHERE el.user_id = ?`,
            userId
        );

        if (!eventRows[0]) {
            // no database results for the given organizer id
            return [];
        }

        // extract an array of the event ids from the query result
        const eventIds = eventRows.map(row => row['event_id']);

        // find all event details asynchronously
        return await Promise.all(
            eventIds.map(eventId => {
                return this.findByEventId(eventId);
            })
        );
    }

    /**
     * Finds a single {@link Event} by matching the given event id.
     *
     * @param {number} eventId the EventMonkey event id
     *
     * @returns {Promise<Event>} the event
     */
    async findByEventId(eventId) {
        const eventRows = await Database.query(
            `SELECT event.*
             FROM Event event
             WHERE event.event_id = ?`,
            eventId
        );

        if (!eventRows[0]) {
            // no database results for the given event id
            return undefined;
        }

        const {
            name,
            description,
            location,
            dates,
            price_ranges: priceRanges
        } = eventRows[0];

        const dateTime = JSON.parse(dates);
        const priceRange = JSON.parse(priceRanges);

        const event = new Event(
            // all event details stored in the database belong to EventMonkey
            SOURCE_EVENT_MONKEY,
            name,
            description,
            location,
            dateTime,
            priceRange
        );

        // guaranteed to match the parameter eventId
        event.id = eventId;

        async function loadGenres() {
            // block until database results are fetched
            const genreRows = await Database.query(
                `SELECT genre.genre_id, genre.name
                 FROM Event_Genre_List egl
                 INNER JOIN Genre genre
                    USING (genre_id)
                 WHERE egl.event_id = ?`,
                eventId
            );

            // convert the resulting json row array into an array of Genre
            const genres = genreRows.map(row => {
                return Genre.createWithId(row['genre_id'], row['name']);
            });

            // now add the genres to the event
            genres.forEach(genre => event.addGenre(genre));
        }

        async function loadImages() {
            // block until database results are fetched
            const imageRows = await Database.query(
                `SELECT image.ratio, image.width, image.height, image.url
                 FROM Event_Image_List eil
                 INNER JOIN Image image
                    USING (image_id)
                 WHERE eil.event_id = ?`, eventId
            );

            // convert the resulting json row array into an array of Image
            const images = imageRows.map(row => {
                return Image.createWithId(
                    row['image_id'],
                    row['ratio'],
                    row['width'],
                    row['height'],
                    row['url']
                );
            });

            // now add the images to the event
            images.forEach(image => event.addImage(image));
        }

        // load genres and images asynchronously
        await Promise.all([loadGenres(), loadImages()])

        return event;
    }

    /**
     * Finds a list of {@link Event}s by an array of genre names. The genre
     * names are case-insensitive.
     *
     * @param {string[]} names an array of genre names
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<Event[]>} a list of events
     */
    async findByGenre(names, limit) {
        // block until database results are fetched. The database is queried by
        // giving a json array of strings as genre name inputs, and the
        // resulting rows are an array of event_ids
        const rows = await Database.query(
            `SELECT DISTINCT egl.event_id
             FROM Event_Genre_List egl
             INNER JOIN Genre genre
                USING (genre_id)
             WHERE JSON_CONTAINS(LOWER(?), JSON_QUOTE(LOWER(genre.name)))`,
            JSON.stringify(names)
        );

        // extract an array of the event ids from the query result
        const eventIds = rows.map(row => row['event_id']);

        // limit the event ids now before querying for event details
        eventIds.length = Math.min(eventIds.length, limit);

        // find all event details asynchronously
        return await Promise.all(
            eventIds.map(eventId => {
                return this.findByEventId(eventId);
            })
        );
    }

    /**
     * Finds a list of {@link Event}s using a keyword to search with.
     *
     * @param {string} searchText the keyword to search with
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<Event[]>} a list of events
     */
    async findByKeyword(searchText, limit) {
        // block until database results are fetched. This query will try and
        // match the search text with the event title, name and genre names
        const rows = await Database.query(
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
        const eventIds = rows.map(row => row['event_id']);

        // limit the event ids now before querying for event details
        eventIds.length = Math.min(eventIds.length, limit);

        // find all event details asynchronously
        return await Promise.all(
            eventIds.map(eventId => {
                return this.findByEventId(eventId);
            })
        );
    }
}

/**
 * An implementation of {@link EventSource} which aggregates {@link Event}s from
 * multiple sources.
 */
export class CompositeSource extends EventSource {

    /** @type {EventSource[]} */
    sources_;

    /**
     * Constructs a new {@link CompositeSource} object.
     *
     * @param {...EventSource} sources event sources to aggregate results from
     */
    constructor(...sources) {
        super();
        this.sources_ = sources || [];
    }

    /**
     * Collect and combine all results from multiple {@link EventSource}s.
     *
     * @param {function(EventSource): any} sourceMapper a function which maps a
     *     source to an array of values to accumulate
     *
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<any[]>} a promise for a list of results
     * @private
     */
    async accumulate_(sourceMapper, limit) {
        /** @type {any[]} */
        const values = (await Promise.all(
            this.sources_.map(source => {
                return sourceMapper(source);
            })
        )).flat(1); // flattens any[][] to any[]

        // trim the values list to the limit
        values.length = Math.min(values.length, limit);

        // values is an array of arrays, so flatten it to a single array
        return values;
    }

    /**
     * Finds a single {@link Event} by matching the given event id.
     *
     * @param {number} eventId the EventMonkey event id
     *
     * @returns {Promise<Event>} the event
     */
    findByEventId(eventId) {
        return this.accumulate_(source => {
            return source.findByEventId(eventId);
        }, 1);
    }

    /**
     * Finds a list of {@link Event}s by an array of genre names. The genre
     * names are case-insensitive.
     *
     * @param {string[]} names an array of genre names
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<Event[]>} a list of events
     */
    findByGenre(names, limit) {
        return this.accumulate_(source => {
            return source.findByGenre(names, limit);
        }, limit);
    }

    /**
     * Finds a list of {@link Event}s using a keyword to search with.
     *
     * @param {string} searchText the keyword to search with
     *
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<Event[]>} a list of events
     */
    findByKeyword(searchText, limit) {
        return this.accumulate_(source => {
            return source.findByKeyword(searchText, limit);
        }, limit);
    }
}

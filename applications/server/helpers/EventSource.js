import fetch from 'node-fetch';

import Event from '../models/Event.js';
import Image from '../models/Image.js';
import Genre from '../models/Genre.js';
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
     * The base URL for TicketMaster's Event resource
     * @private
     * @type {string}
     */
    static eventURL_ = 'https://app.ticketmaster.com/discovery/v2/events';

    /**
     * The TicketMaster api key
     * @private
     * @type {string}
     */
    static apiKey_ = 'GizI5muMuL6p9HaGh2FkmyHz9Hv3WMfW';

    /**
     * Fetches a response from a URL. Query parameters can be added to the base
     * URL by populating key-value pairs in the <code>values</code> object. For
     * example,
     * <br>
     * <code>
     *     apiRequest_('http://api.request.com', {
     *         apikey: 'someApiKey',
     *         key1: val1,
     *         key2: val2
     *     })
     * </code>
     * <br>
     * would result in fetching from the URL:
     * <br>
     * <code>
     *     'http://api.request.com?apikey=someApiKey&key1=val1&key2=val2'
     * </code>
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
            TicketMasterSource.eventURL_,
            { apikey: TicketMasterSource.apiKey_, ...values }
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
                const { currency: currency, min: nextMin, max: nextMax }
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
            return new Image(undefined, ratio, width, height, url);
        });

        const genreSet = new Set();

        eventObj['genres'].forEach(classObj => {
            genreSet.add(new Genre(undefined, classObj['segment']['name']));
            genreSet.add(new Genre(undefined, classObj['genre']['name']));
            genreSet.add(new Genre(undefined, classObj['subGenre']['name']));
        });

        return new Event(
            eventObj['id'],
            eventObj['name'],
            description,
            date,
            priceRange,
            images,
            Array.from(genreSet)
        );
    }

    /**
     * Finds a single {@link Event} by matching the given event id.
     *
     * @param {number} eventId the EventMonkey event id
     *
     * @returns {Promise<Event>} the event
     */
    findByEventId(eventId) {
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
    findByGenre(names, limit) {
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
    findByKeyword(searchText, limit) {
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
     * Create an event by inserting it into the database. The event id will get
     * set if the insert operation was successful, and the event will be
     * assigned to the organizer.
     *
     * @param {Organizer} organizer the owner of this event
     * @param {Event} event the event to insert into the database
     *
     * @returns {Promise<void>}
     */
    async createEvent(organizer, event) {
        // insert event details to database
        // if successful
        //   set event id
        //   add event to organizer event list
        // return event?
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
             WHERE el.user_id = ?`, userId
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
             WHERE event.event_id = ?`, eventId
        );

        if (!eventRows[0]) {
            // no database results for the given event id
            return undefined;
        }

        const { event_id: eId, name, price_ranges: priceRanges, dates,
                description } = eventRows[0];

        const dateTime = JSON.parse(dates);
        const priceRange = JSON.parse(priceRanges);

        const event = new Event(eId, name, description, dateTime, priceRange);

        async function loadGenres() {
            // block until database results are fetched
            const genreRows = await Database.query(
                `SELECT genre.genre_id, genre.name
                 FROM Event_Genre_List egl
                 INNER JOIN Genre genre
                    USING (genre_id)
                 WHERE egl.event_id = ?`, eventId
            );

            // convert the resulting json row array into an array of Genre
            const genres = genreRows.map(row => {
                return new Genre(row['genre_id'], row['name']);
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

            // convert the resulting json row array into an array of Genre
            const images = imageRows.map(row => {
                return new Image(
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
        return [];
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
     *     source to an array of values to collate
     *
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<any[]>} a promise for a list of results
     * @private
     */
    async collate_(sourceMapper, limit) {
        /** @type {any[][]} */
        const values = await Promise.all(
            this.sources_.map(source => {
                return sourceMapper(source);
            })
        );

        // trim the values list to the limit
        values.length = Math.min(values.length, limit);

        // values is an array of arrays, so flatten it to a single array
        return values.flat(1);
    }

    /**
     * Finds a single {@link Event} by matching the given event id.
     *
     * @param {number} eventId the EventMonkey event id
     *
     * @returns {Promise<Event>} the event
     */
    findByEventId(eventId) {
        return this.collate_(source => {
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
        return this.collate_(source => {
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
        return this.collate_(source => {
            return source.findByKeyword(searchText, limit);
        }, limit);
    }
}

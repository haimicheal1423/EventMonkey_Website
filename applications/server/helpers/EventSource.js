import fetch from 'node-fetch';

import Event from '../models/Event.js';
import Image from '../models/Image.js';
import Genre from '../models/Genre.js';
import Classification from '../models/Classification.js';
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
     * Finds a list of {@link Event}s by matching the given event id.
     *
     * @param {string|number} eventId the id to locate the event details from
     *     the source
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<Event[]>} a list of events
     * @abstract
     */
    findByEventId(eventId, limit) {
        throw new Error('Unimplemented abstract function');
    }

    /**
     * Finds a list of {@link Event}s by an array of genre names.
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
            const rangeMap = {};

            for (const nextPriceRange of priceRanges) {
                const { currency: currency, min: nextMin, max: nextMax }
                    = nextPriceRange;

                if (rangeMap[currency]) {
                    const { min: curMin, max: curMax } = rangeMap[currency];

                    // update the price range for the mapped currency type
                    rangeMap[currency].min = Math.min(curMin, nextMin);
                    rangeMap[currency].max = Math.max(curMax, nextMax);
                } else {
                    // no mapping for currency type yet
                    rangeMap[currency] = {
                        currency: currency,
                        min: nextMin,
                        max: nextMax
                    };
                }
            }

            // the 'currency' keys can be dropped and only keep the values array
            // of price ranges, each with a unique currency type
            return Object.values(rangeMap);
        }

        function constructImage(imageObj) {
            const { ratio, width, height, url } = imageObj;
            return new Image(undefined, ratio, width, height, url);
        }

        function constructClassification(classification) {
            // helper function for enhancing readability
            function constructGenre(genreObj) {
                if (!genreObj) {
                    return new Genre(undefined, undefined);
                }
                return new Genre(genreObj['id'], genreObj['name']);
            }

            const segment = constructGenre(classification['segment']);
            const genre = constructGenre(classification['genre']);
            const subgenre = constructGenre(classification['subGenre']);
            return new Classification(undefined, segment, genre, subgenre);
        }

        // sometimes TicketMaster event properties are undefined, so try and
        // find the best information to fill in
        const description = eventObj['description']
            || eventObj['info']
            || eventObj['pleaseNote']
            || 'No description available';

        const date = new Date(eventObj['dates']['start']['dateTime']);

        // not all TicketMaster events have defined price ranges
        const priceRange = constructPriceRange(eventObj['priceRanges'] || []);

        const images = eventObj['images']
            .map(image => constructImage(image));

        const classifications = eventObj['classifications']
            .map(classification => constructClassification(classification));

        return new Event(
            eventObj['id'],
            eventObj['name'],
            description,
            date,
            priceRange,
            images,
            classifications
        );
    }

    /**
     * Finds a list of {@link Event}s by matching the given event id.
     *
     * @param {string} eventId the TicketMaster event id
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<Event[]>} a list of events
     */
    findByEventId(eventId, limit) {
        return this.ticketMasterEventRequest_({
            id: eventId,
            size: limit
        }, limit);
    }

    /**
     * Finds a list of {@link Event}s by an array of genre names.
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
     * Constructs a {@link Classification} for the given EventMonkey
     * classification and {@link Genre} ids.
     *
     * @param classId the EventMonkey classification id
     * @param segmentId the EventMonkey segment id
     * @param genreId the EventMonkey genre id
     * @param subgenreId the EventMonkey subgenre id
     *
     * @returns {Promise<Classification>}
     * @private
     */
    async constructClassification_(classId, segmentId, genreId, subgenreId) {
        /**
         * Constructs a {@link Genre} for a given EventMonkey genre id. The
         * genre name is retrieved by querying the database.
         *
         * @param genreId the EventMonkey genre id
         * @returns {Promise<Genre>}
         */
        async function constructGenre(genreId) {
            const rows = await Database.query(
                `SELECT genre.name
                 FROM Genre genre
                 WHERE genre.id = ?`, genreId
            );

            if (!rows[0]) {
                // no genre results
                return undefined;
            }
            const { name } = rows[0];
            return new Genre(genreId, name);
        }

        // block until all genre types are constructed (asynchronously)
        const [segment, genre, subgenre]
            = await Promise.all([
                constructGenre(segmentId),
                constructGenre(genreId),
                constructGenre(subgenreId)
            ]);

        return new Classification(classId, segment, genre, subgenre);
    }

    /**
     * Create an event by inserting it into the database. The event id will get
     * set if the insert operation was successful, and the event will be
     * assigned to the organizer.
     *
     * @param {Organizer} organizer the owner of this event
     * @param {Event} event the event to insert into the database
     *
     * @return {Promise<void>}
     */
    async createEvent(organizer, event) {
        // insert event details to database
        // if successful
        //   set event id
        //   add event to organizer event list
        // return event?
    }

    /**
     * Finds all events owned by a specific organizer.
     *
     * @param organizerId the id of the organizer
     *
     * @return {Promise<Event[]>}
     */
    async findByOrganizerId(organizerId) {
        return [];
    }

    /**
     * Finds a list of {@link Event}s by matching the given event id.
     *
     * @param {string|number} eventId the id to locate the event details from
     *     the source
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<Event[]>} a list of events
     */
    async findByEventId(eventId, limit) {
        const eventRows = await Database.query(
            `SELECT event.*
             FROM Event event
             WHERE event.event_id = ?`, eventId
        );

        if (!eventRows[0]) {
            // no database results for the given event id
            return [];
        }

        const { event_id: eId, name, price_ranges: priceRanges, dates,
                description } = eventRows[0];

        const { dateTime } = JSON.parse(dates);
        const priceRange = JSON.parse(priceRanges);

        const event = new Event(eId, name, description, dateTime, priceRange);

        // block until database results are fetched
        const classRows = await Database.query(
            `SELECT class.*
             FROM Classification class
             JOIN Event_Classification_List ecl
               USING (class_id)
             WHERE ecl.event_id = ?`, eventId
        );

        // block until all classifications are constructed (asynchronously)
        const classList = await Promise.all(
            classRows.map(row =>
                this.constructClassification_(
                    row['class_id'],
                    row['segment_id'],
                    row['genre_id'],
                    row['subgenre_id']
                )
            ));

        // after all classifications are resolved, add then to the event
        classList.forEach(classification => {
            event.addClassification(classification);
        });

        return [event];
    }

    /**
     * Finds a list of {@link Event}s by an array of genre names.
     *
     * @param {string[]} names an array of genre names
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<Event[]>} a list of events
     */
    async findByGenre(names, limit) {
        return [];
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
        return values.reduce((acc, array) => {
            acc.push(...array);
            return acc;
        }, []);
    }

    /**
     * Finds a list of {@link Event}s by matching the given event id.
     *
     * @param {string|number} eventId the id to locate the event details from
     *     the source
     *
     * @param {number} limit the maximum size of the resulting array
     *
     * @returns {Promise<Event[]>} a list of events
     */
    findByEventId(eventId, limit) {
        return this.collate_(source => {
            return source.findByEventId(eventId, limit);
        }, limit);
    }

    /**
     * Finds a list of {@link Event}s by an array of genre names.
     *
     * @param {string[]} names an array of genre names
     *
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

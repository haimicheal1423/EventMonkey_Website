import fetch from 'node-fetch';

import Event from '../models/Event.js';
import Image from '../models/Image.js';
import Genre from '../models/Genre.js';
import Classification from '../models/Classification.js';

export class EventSource {
    constructor() {
        if (this.constructor === EventSource) {
            throw new Error('Cannot instantiate abstract class');
        }
    }

    findByEventId(eventId) {
        throw new Error('Unimplemented abstract function');
    }

    findByClassification(classification) {
        throw new Error('Unimplemented abstract function');
    }

    findBySegment(segment) {
        throw new Error('Unimplemented abstract function');
    }

    findByKeyword(searchText) {
        throw new Error('Unimplemented abstract function');
    }
}

export class TicketMasterSource extends EventSource {
    static eventURL_ = 'https://app.ticketmaster.com/discovery/v2/events';
    static apiKey_ = 'GizI5muMuL6p9HaGh2FkmyHz9Hv3WMfW';

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

    constructEvent_(eventObj) {
        function constructPriceRange(priceRanges) {

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
            return Object.values(rangeMap);
        }

        function constructImage(imageObj) {
            const { ratio, width, height, url } = imageObj;
            return new Image(undefined, ratio, width, height, url);
        }

        function constructClassification(classification) {
            // helper function for enhancing readability
            function constructGenre(genreObj) {
                return new Genre(undefined, genreObj['name'], genreObj['id']);
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

    async findByEventId(eventId) {
        return await this.apiRequest_(TicketMasterSource.eventURL_, {
            apikey: TicketMasterSource.apiKey_,
            eventId: eventId
        })
            .then(response => response.json())
            .then(response => {
                const events = response['_embedded']['events'];
                return events.map(eventObj => this.constructEvent_(eventObj));
            });
    }

    async findByClassification(classification) {
        return await this.apiRequest_(TicketMasterSource.eventURL_, {
            apikey: TicketMasterSource.apiKey_,
            classificationId: classification.id
        })
            .then(response => response.json())
            .then(response => {
                const events = response['_embedded']['events'];
                return events.map(eventObj => this.constructEvent_(eventObj));
            });
    }

    async findBySegment(segment) {
        return await this.apiRequest_(TicketMasterSource.eventURL_, {
            apikey: TicketMasterSource.apiKey_,
            segmentId: segment.id
        })
            .then(response => response.json())
            .then(response => {
                const events = response['_embedded']['events'];
                return events.map(eventObj => this.constructEvent_(eventObj));
            });
    }

    async findByKeyword(searchText) {
        return await this.apiRequest_(TicketMasterSource.eventURL_, {
            apikey: TicketMasterSource.apiKey_,
            keyword: searchText
        })
            .then(response => response.json())
            .then(response => {
                const events = response['_embedded']['events'];
                return events.map(eventObj => this.constructEvent_(eventObj));
            });
    }
}

export class EventMonkeySource extends EventSource {
    async createEvent(organizer, event) {
        // insert event details to database
        // if successful
        //   set event id
        //   add event to organizer event list
        // return event?
    }

    async findByOrganizerId(organizerId) {
        return [];
    }

    async findByEventId(eventId) {
        return [];
    }

    async findByClassification(classification) {
        return [];
    }

    async findBySegment(segment) {
        return [];
    }

    async findByKeyword(searchText) {
        return [];
    }
}

export class CompositeSource extends EventSource {
    #sources;

    constructor(...sources) {
        super();
        this.#sources = sources || [];
    }

    async findByEventId(eventId) {
        return this.#sources
            .map(source => source.findByEventId(eventId))
            .reduce((prev, curr) => {
                prev.push(...curr);
                return prev;
            }, []);
    }

    async findByClassification(classification) {
        return this.#sources
            .map(source => source.findByClassification(classification))
            .reduce((prev, curr) => {
                prev.push(...curr);
                return prev;
            }, []);
    }

    async findBySegment(segment) {
        return this.#sources
            .map(source => source.findBySegment(segment))
            .reduce((prev, curr) => {
                prev.push(...curr);
                return prev;
            }, []);
    }

    async findByKeyword(searchText) {
        return this.#sources
            .map(source => source.findByKeyword(searchText))
            .reduce((prev, curr) => {
                prev.push(...curr);
                return prev;
            }, []);
    }
}
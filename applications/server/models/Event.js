import { Image } from "./Image.js";
import { Genre } from "./Genre.js";

/**
 * The source type for events created and stored in the EventMonkey database.
 * @type {string}
 */
export const SOURCE_EVENT_MONKEY = 'EVENT_MONKEY';

/**
 * The source type for events created and stored through TicketMaster.
 * @type {string}
 */
export const SOURCE_TICKET_MASTER = 'TICKET_MASTER';

/**
 * The Event data type is a container which holds event details.
 */
export class Event {

    /** @type {number|string} */
    id;

    /** @type {string} */
    source;

    /** @type {string} */
    name;

    /** @type {string} */
    description;

    /** @type {string} */
    location;

    /** @type {{ startDateTime: Date, [endDateTime]: Date }} */
    dates;

    /** @type {{currency: string, min: number, max: number}[]} */
    priceRanges;

    /** @type {Image[]} */
    images;

    /** @type {Genre[]} */
    genres;

    /**
     * @param {string} source
     * @param {string} name
     * @param {string} description
     * @param {string} location
     * @param {{ startDateTime: Date, [endDateTime]: Date }} dates
     * @param {{ currency: string, min: number, max: number }[]} priceRanges
     * @param {Image[]} [images]
     * @param {Genre[]} [genres]
     */
    constructor(source, id, name, description, location, dates, priceRanges,
                images = [], genres = []) {
        this.source = source;
        this.id = id;
        this.name = name;
        this.description = description;
        this.location = location;
        this.dates = dates;
        this.priceRanges = priceRanges;
        this.images = images;
        this.genres = genres;
    }

    /**
     * Adds an {@link Image} to the end of the {@link images}
     * array.
     *
     * @param {Image} image the {@link Image} to add to the array
     */
    addImage(image) {
        this.images.push(image);
    }

    /**
     * Removes all {@link Image}s from the {@link images}
     * array.
     *
     * @param {Image} image the image to filter out of the array (by image id)
     */
    removeImage(image) {
        this.images = this.images
            .filter(other => other.id !== image.id);
    }

    /**
     * Add a {@link Genre} to the {@link genres} array.
     *
     * @param {Genre} genre the genre to add to the array
     */
    addGenre(genre) {
        this.genres.push(genre);
    }

    /**
     * Remove every occurrence of the given genre from the {@link genres} array.
     *
     * @param {Genre} genre the genre to filter out of the array (by genre id)
     */
    removeGenre(genre) {
        this.genres = this.genres
            .filter(other => other.id !== genre.id);
    }

    /**
     * Sets the price range.
     *
     * @param {string} currency the currency type
     * @param {number} min the minimum price
     * @param {number} [max=min] the maximum price
     */
    setPriceRange(currency, min, max = min) {
        let found = false;
        for (const priceRange of this.priceRanges) {
            if (priceRange.currency !== currency) {
                continue;
            }
            priceRange.min = min;
            priceRange.max = max;
            found = true;
        }

        if (!found) {
            this.priceRanges.push({ currency, min, max });
        }
    }

    static verifyName(name) {
        if (!name) {
            throw new Error('Event name required');
        }

        // mariadb tinytext is 255 chars max
        if (name.length > 255) {
            throw new Error('Event name must be less than 255 characters');
        }
    }

    static verifyLocation(location) {
        if (!location) {
            throw new Error('Event location required');
        }

        // mariadb tinytext is 255 chars max
        if (location.length > 255) {
            throw new Error('Event name must be less than 255 characters');
        }
    }

    static verifyDescription(description) {
        if (description) {
            // mariadb text is 65535 chars max
            if (description.length > 65535) {
                throw new Error('Event description must be less than 65535'
                              + ' characters');
            }
        }
    }

    static verifyDates(dates) {
        if (!dates) {
            throw new Error('Event dates required');
        }

        if (!dates['startDateTime']) {
            throw new Error('Start date time required');
        }

        if (JSON.stringify(dates).length > 65535) {
            throw new Error('Event dates text must be less than 65535'
                          + ' characters');
        }
    }

    static verifyPriceRanges(priceRanges) {
        if (!priceRanges) {
            // events can be free (price range is undefined or empty array)
            return;
        }

        if (!Array.isArray(priceRanges)) {
            throw new Error('Event price ranges must be an array');
        }

        if (priceRanges.length === 0) {
            // events can be free (price range is undefined or empty array)
            return;
        }

        if (!priceRanges['currency']) {
            throw new Error('Missing currency in price range');
        }

        if (!priceRanges['min']) {
            throw new Error('Missing min price in price range');
        }

        if (JSON.stringify(priceRanges).length > 65535) {
            throw new Error('Event price ranges text must be less than'
                + ' 65535 characters');
        }
    }

    static verifyGenres(genres) {
        if (!genres) {
            // genres are optional
            return;
        }

        if (!Array.isArray(genres)) {
            throw new Error('Event genres must be an array');
        }

        genres.forEach(genre => {
            Genre.verifyGenre(genre);

            if (genre.name.length > 255) {
                throw new Error('Image ratio must be less than 255 characters');
            }
        });
    }

    static verifyImages(images) {
        if (!images) {
            // images are optional
            return;
        }

        if (!Array.isArray(images)) {
            throw new Error('Event images must be an array');
        }

        images.forEach(image => {
            Image.verifyImage(image);

            if (image.ratio.length > 255) {
                throw new Error('Image ratio must be less than 255 characters');
            }

            if (image.url.length > 255) {
                throw new Error('Image url must be less than 255 characters');
            }
        });
    }
}

/**
 * A container for event ids and a source which specifies where the data is
 * stored.
 */
export class EventList {

    /** @type {string} */
    source;

    /** @type {number[]|string[]} */
    eventIds;

    /**
     * @param {string} source
     * @param {number[]|string[]} eventIds
     */
    constructor(source, eventIds) {
        this.source = source;
        this.eventIds = eventIds;
    }
}

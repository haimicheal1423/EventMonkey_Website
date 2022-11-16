import { Image } from "./Image.js";
import { Genre } from "./Genre.js";

/**
 * The source type for events created and stored in the EventMonkey database.
 * @type {string}
 */
export const SOURCE_EVENT_MONKEY = 'eventMonkey';

/**
 * The source type for events created and stored through TicketMaster.
 * @type {string}
 */
export const SOURCE_TICKET_MASTER = 'ticketMaster';

/**
 * The Event data type is a container which holds event details.
 */
export class Event {

    /** @type {number} */
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
    constructor(source, name, description, location, dates, priceRanges,
                images = [], genres = []) {
        this.source = source;
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

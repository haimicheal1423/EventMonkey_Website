/**
 * The Event data type is a container which holds event details.
 */
export default class Event {

    /** @type {number} */
    id;

    /** @type {string} */
    name;

    /** @type {string} */
    description;

    /** @type {{ startDateTime: Date, [endDateTime: Date] }} */
    dates;

    /** @type {{currency: string, min: number, max: number}[]} */
    priceRanges;

    /** @type {Image[]} */
    images;

    /** @type {Genre[]} */
    genres;

    /**
     * @param {number} [eventId]
     * @param {string} name
     * @param {string} description
     * @param {{ startDateTime: Date, [endDateTime: Date] }} dates
     * @param {{ currency: string, min: number, max: number }[]} priceRanges
     * @param {Image[]} [images]
     * @param {Genre[]} [genres]
     */
    constructor(eventId, name, description, dates, priceRanges, images = [],
                genres = []) {
        this.id = eventId;
        this.name = name;
        this.description = description;
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

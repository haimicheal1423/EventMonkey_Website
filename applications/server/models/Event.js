/**
 * The Event data type is a container which holds event details.
 */
export default class Event {

    /** @type {string|number} */
    id;

    /** @type {string} */
    name;

    /** @type {string} */
    description;

    /** @type {Date} */
    date;

    /** @type {{currency: string, min: number, max: number}} */
    priceRange;

    /** @type {Array<Image>} */
    images;

    /** @type {Array<Classification>} */
    classifications;

    /**
     * @param {string|number} eventId
     * @param {string} name
     * @param {string} description
     * @param {Date} date
     * @param {{currency: string, min: number, max: number}} priceRange
     * @param {Array<Image>} [images]
     * @param {Array<Classification>} [classifications]
     */
    constructor(eventId, name, description, date, priceRange, images = [],
                classifications = []) {
        this.id = eventId;
        this.name = name;
        this.description = description;
        this.date = date;
        this.priceRange = priceRange;
        this.images = images;
        this.classifications = classifications;
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
     * Add a {@link Classification} to the {@link classifications} array.
     *
     * @param {Classification} classification the classification to add to the
     *     array
     */
    addClassification(classification) {
        this.classifications.push(classification);
    }

    /**
     * Remove every occurrence of the given classification from the
     * {@link classifications} array.
     *
     * @param {Classification} classification the classification to filter out
     *     of the array (by classification id)
     */
    removeClassification(classification) {
        this.classifications = this.classifications
            .filter(other => other.classId !== classification.classId);
    }

    /**
     * Sets the price range.
     *
     * @param {string} currency the currency type
     * @param {number} min the minimum price
     * @param {number} [max=min] the maximum price
     */
    setPriceRange(currency, min, max = min) {
        this.priceRange = {
            currency: currency,
            min: min,
            max: max
        };
    }
}

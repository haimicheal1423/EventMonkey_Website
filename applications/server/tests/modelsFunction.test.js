import { describe, expect, test } from '@jest/globals';
import Event from '../models/Event.js';
import Image from '../models/Image.js';
import Genre from '../models/Genre.js';

const eventClass = new Event;
const imageObj = new Image(12345, '16:9', 1920, 1080, 'test_fake_img.png');
const genreObj = new Genre(1234567890, 'Miscellaneous Genre')

describe('[BASIC] Testing Event Class Functions', () => {
    /**
     * A test of the addImage function by passing in a constant image object
     * imageObj. Runs the addImage function before the expect, and allowing
     * expect to equal the eventClass.images variable to equal imageObj in an
     * array such that: [imageObj].
     */
    test('Testing addImage function; adding to images', () => {
        // adding imageObj to eventClass class
        eventClass.addImage(imageObj);
        // Testing that class.images has an array with imageObj
        expect(eventClass.images)
            .toStrictEqual([imageObj]);
    });

    /**
     * A test of the removeImage function by passing in a constant image object
     * imageObj. Runs the removeImage function before the expect. It also
     * relies on the addImage function in the previous test to have added an
     * object into the class. This removes it resulting in the eventClass.images
     * variable to be an empty array such that: [].
     */
    test('Testing removeImage function; removing from images', () => {
        // Removing imageObj from eventClass class
        eventClass.removeImage(imageObj);
        // Testing that eventClass.images is now empty; was previously populated
        // by addImage test before it
        expect(eventClass.images)
            .toStrictEqual([]);
    });

    /**
     * A test of the addGenre function by passing in a constant genre object
     * genreObj. Runs the addGenre function before the expect, and allowing
     * expect to equal the eventClass.genres variable to equal genreObj in an
     * array such that: [genreObj].
     */
    test('Testing addGenre function; adding to genres', () => {
        // Adding genreObj to eventClass class
        eventClass.addGenre(genreObj);
        // Testing that class.genres has an array with genreObj
        expect(eventClass.genres)
            .toStrictEqual([genreObj]);
    });

    /**
     * A test of the removeGenre function by passing in a constant genre object
     * genreObj. Runs the removeGenre function before the expect. It also
     * relies on the addGenre function in the previous test to have added an
     * object into the class. This removes it resulting in the eventClass.genres
     * variable to be an empty array such that: [].
     */
    test('Testing removeGenre function; removing from genres', () => {
        // Removing genreObj from eventClass class
        eventClass.removeGenre(genreObj);
        // Testing that eventClass.genres is now empty; was previously populated
        // by addGenre test before it
        expect(eventClass.genres)
            .toStrictEqual([]);
    });

    test('Testing setPriceRange function; setting a price range', () => {
        // Passing a currency indicator, and two integer values
        eventClass.setPriceRange('$', 50, 100);
        // Testing that eventClass.priceRanges now includes the price range
        expect(eventClass.priceRanges)
            .toStrictEqual();
    });

    test('Testing setPriceRange function; without range, min = max', () => {
        // Passing a currency indicator, and one integer value
        eventClass.setPriceRange('$', 75);
        // Testing that eventClass.priceRanges now includes the price range
        expect(eventClass.priceRanges)
            .toStrictEqual();
    });
});

/**
 * Should we have the small functions verify that the items added are valid?
 * Such as addImage function making sure it is an Image object before accepting?
 *
 * Error with setPriceRanges
 * TypeError: this.priceRanges is not iterable
 *
 */

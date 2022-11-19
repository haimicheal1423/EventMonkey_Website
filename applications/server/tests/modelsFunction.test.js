import { describe, expect, test } from '@jest/globals';
import Event from '../models/Event.js';
import Genre from '../models/Genre.js';
import Image from '../models/Image.js';
import { User } from '../models/User.js';

describe('Testing Event Class Functions', () => {
    const eventClass = new Event;

    // addImage and removeImage function tests
    // ========================================================================
    // Test image object
    let imageObj = new Image(12345, '16:9', 1920, 1080, 'test_fake_img.png');

    /**
     * It is assumed that the input values are correct types and formats.
     * A test of the removeImage function given that there is no pre-existing
     * image object, or given image object is not present. The function should
     * still be able to pass and execute correctly as it removes the image
     * object based on id and does so, despite there being no object with that
     * id present. The eventClass.images will stay as an empty array, or one in
     * the same state before the calling of removeImage, such that: [].
     * Before Test: eventClass.images = []
     * After Test:  eventClass.images = []
     */
    test('Testing removeImage function: removing obj that isn\'t there', () => {
        // Removing imageObj from eventClass class
        eventClass.removeImage(imageObj);
        // Testing that eventClass.images is now empty; was previously populated
        // by addImage test before it
        expect(eventClass.images)
            .toStrictEqual([]);
    });

    /**
     * It is assumed that the input values are correct types and formats.
     * A test of the addImage function by passing in a constant image object
     * imageObj. Runs the addImage function before the expect, and allowing
     * expect to equal the eventClass.images variable to equal imageObj in an
     * array such that: [imageObj].
     * Before Test: eventClass.images = []
     * After Test:  eventClass.images = [imageObj]
     */
    test('Testing addImage function: adding to images', () => {
        // adding imageObj to eventClass class
        eventClass.addImage(imageObj);
        // Testing that class.images has an array with imageObj
        expect(eventClass.images)
            .toStrictEqual([imageObj]);
    });

    /**
     * It is assumed that the input values are correct types and formats.
     * A test of the removeImage function by passing in a constant image object
     * imageObj. Runs the removeImage function before the expect. It also
     * relies on the addImage function in the previous test to have added an
     * object into the class. This removes it resulting in the eventClass.images
     * variable to be an empty array such that: [].
     * Before Test: eventClass.images = [imageObj]
     * After Test:  eventClass.images = []
     */
    test('Testing removeImage function: removing from images', () => {
        // Removing imageObj from eventClass class
        eventClass.removeImage(imageObj);
        // Testing that eventClass.images is now empty; was previously populated
        // by addImage test before it
        expect(eventClass.images)
            .toStrictEqual([]);
    });

    // addGenre and removeGenre function tests
    // ========================================================================
    // Test genre object
    let genreObj = new Genre(1234567890, 'Miscellaneous Genre');

    /**
     * It is assumed that the input values are correct types and formats.
     * A test of the removeGenre function given that there is no pre-existing
     * genre object, or given genre object is not present. The function should
     * still be able to pass and execute correctly as it removes the genre
     * object based on id and does so, despite there being no object with that
     * id present. The eventClass.genres will stay as an empty array, or one in
     * the same state before the calling of removeGenre, such that: [].
     * Before Test: eventClass.genres = []
     * After Test:  eventClass.images = []
     */
    test('Testing removeGenre function: removing obj that isn\'t there', () => {
        // Removing genreObj from eventClass class
        eventClass.removeGenre(genreObj);
        // Testing that eventClass.genres is now empty; was previously populated
        // by addGenre test before it
        expect(eventClass.genres)
            .toStrictEqual([]);
    });

    /**
     * It is assumed that the input values are correct types and formats.
     * A test of the addGenre function by passing in a constant genre object
     * genreObj. Runs the addGenre function before the expect, and allowing
     * expect to equal the eventClass.genres variable to equal genreObj in an
     * array such that: [genreObj].
     * Before Test: eventClass.genres = []
     * After Test:  eventClass.images = [genreObj]
     */
    test('Testing addGenre function: adding to genres', () => {
        // Adding genreObj to eventClass class
        eventClass.addGenre(genreObj);
        // Testing that class.genres has an array with genreObj
        expect(eventClass.genres)
            .toStrictEqual([genreObj]);
    });

    /**
     * It is assumed that the input values are correct types and formats.
     * A test of the removeGenre function by passing in a constant genre object
     * genreObj. Runs the removeGenre function before the expect. It also
     * relies on the addGenre function in the previous test to have added an
     * object into the class. This removes it resulting in the eventClass.genres
     * variable to be an empty array such that: [].
     * Before Test: eventClass.genres = [genreObj]
     * After Test:  eventClass.images = []
     */
    test('Testing removeGenre function: removing from genres', () => {
        // Removing genreObj from eventClass class
        eventClass.removeGenre(genreObj);
        // Testing that eventClass.genres is now empty; was previously populated
        // by addGenre test before it
        expect(eventClass.genres)
            .toStrictEqual([]);
    });

});

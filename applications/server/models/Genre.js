/**
 * The Genre data type holds the name and the EventMonkey genre id.
 */
export default class Genre {

    /**
     * The EventMonkey genre id.
     * @type {number}
     */
    id;

    /**
     * The genre name.
     *  @type {string}
     */
    name;

    /**
     * A static factory function to create a genre with an initially undefined
     * id.
     *
     * @param {string} name the genre name
     *
     * @returns {Genre} a genre with an undefined id
     */
    static create(name) {
        const genre = new Genre();
        genre.name = name;
        return genre;
    }

    /**
     * A static factory function to create a genre with a defined id.
     *
     * @param {number} id the EventMonkey genre id
     * @param {string} name the genre name
     *
     * @returns {Genre} a genre with an undefined id
     */
    static createWithId(id, name) {
        const genre = new Genre();
        genre.id = id;
        genre.name = name;
        return genre;
    }
}

/**
 * The Genre data type holds the name and the genre id for all data sources.
 */
export default class Genre {

    /**
     * The EventMonkey genre id.
     * @type {number}
     */
    id;

    /** @type {string} */
    name;

    /**
     * @param {number} id the EventMonkey genre id
     * @param {string} name the genre name
     */
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

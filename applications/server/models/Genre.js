/**
 * The Genre data type holds the name and the genre id for all data sources.
 */
export default class Genre {

  /**
   * The EventMonkey genre id.
   * @type {number}
   */
  id;

  /**
   * The TicketMaster genre id.
   * @type {string}
   */
  apiId;

  /** @type {string} */
  name;

    /**
     * @param {number} id the EventMonkey genre id
     * @param {string} apiId the TicketMaster genre id
     * @param {string} name the genre name
     */
  constructor(id, apiId, name) {
    this.id = id;
    this.name = name;
    this.apiId = apiId;
  }
}

/**
 * A Classification has a three-tier {@link Genre} structure. The primary genre
 * is the <i>segment</i>, the secondary genre is the <i>genre</i> and the
 * tertiary genre is the <i>sub-genre</i>.
 * <br>
 * The <i>segment</i> is a broad genre, where the <i>genre</i> is more specific,
 * and the <i>sub-genre</i> adds more detail.
 * <br>
 * An example for a classification:
 * | segment | genre      | sub-genre |
 * |:-------:|:----------:|:--------:|
 * | Sports  | Basketball | NBA      |
 */
export default class Classification {

  /** @type {number} */
  classId;

  /** @type {Genre} */
  segment;

  /** @type {Genre} */
  genre;

  /** @type {Genre} */
  subgenre;

  /**
   * @param {number} classId
   * @param {Genre} segment
   * @param {Genre} genre
   * @param {Genre} subgenre
   */
  constructor(classId, segment, genre, subgenre) {
    this.classId = classId;
    this.segment = segment;
    this.genre = genre;
    this.subgenre = subgenre;
  }
}

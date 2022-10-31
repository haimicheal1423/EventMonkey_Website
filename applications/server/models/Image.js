/**
 * An Image object holds meta-data to an image resource. The actual image data
 * is fetched through the url.
 */
export default class Image {

  /** @type {number} */
  id;

  /**
   * The aspect ratio of the image using the format {width}_{height}.
   * @type {string}
   */
  ratio;

  /** @type {number} */
  width;

  /** @type {number} */
  height;

  /**
   * The URL to the actual image resource.
   * @type {string}
   */
  url;

  /**
   * @param {number} id
   * @param {string} ratio
   * @param {number} width image width
   * @param {number} height image height
   * @param {string} url the location to the actual image resource
   */
  constructor(id, ratio, width, height, url) {
    this.id = id;
    this.ratio = ratio;
    this.width = width;
    this.height = height;
    this.url = url;
  }
}

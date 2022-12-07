/**
 * An Image object holds meta-data to an image resource. The actual image data
 * is fetched through the url.
 */
export class Image {

    /**
     * The EventMonkey image id.
     * @type {number}
     */
    id;

    /**
     * The aspect ratio of the image using the format {width}_{height}.
     * @type {string}
     */
    ratio;

    /**
     * The image width.
     *  @type {number}
     */
    width;

    /**
     * The image height.
     * @type {number}
     */
    height;

    /**
     * The URL to the actual image resource.
     * @type {string}
     */
    url;

    /**
     * A static factory function to create an image with an initially undefined
     * id.
     *
     * @param {string} ratio the image aspect ratio
     * @param {number} width the image width
     * @param {number} height the image height
     * @param {string} url the location to the actual image resource
     *
     * @returns {Image}
     */
    static create(ratio, width, height, url) {
        const image = new Image();
        image.ratio = ratio;
        image.width = width;
        image.height = height;
        image.url = url;
        return image;
    }

    /**
     * A static factory function to create an image with an initially undefined
     * id.
     *
     * @param {number} id the EventMonkey image id
     * @param {string} ratio the image aspect ratio
     * @param {number} width the image width
     * @param {number} height the image height
     * @param {string} url the location to the actual image resource
     *
     * @returns {Image}
     */
    static createWithId(id, ratio, width, height, url) {
        const image = new Image();
        image.id = id;
        image.ratio = ratio;
        image.width = width;
        image.height = height;
        image.url = url;
        return image;
    }

    static verifyImage(image) {
        if (!image) {
            throw new Error('Image undefined')
        }

        if (image['ratio'] === undefined) {
            throw new Error('Image missing ratio')
        }

        if (image['width'] === undefined) {
            throw new Error('Image missing width')
        }

        if (image['height'] === undefined) {
            throw new Error('Image missing height')
        }

        if (image['url'] === undefined) {
            throw new Error('Image missing url')
        }

        if (image.ratio.length > 255) {
            throw new Error('Image ratio must be less than 255 characters');
        }

        if (image.url.length > 255) {
            throw new Error('Image url must be less than 255 characters');
        }
    }
}

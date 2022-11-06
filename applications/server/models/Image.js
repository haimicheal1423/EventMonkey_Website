export default class Image {
    id;
    ratio;
    width;
    height;
    url;

    constructor(id, ratio, width, height, url) {
        this.id = id;
        this.ratio = ratio;
        this.width = width;
        this.height = height;
        this.url = url;
    }
}
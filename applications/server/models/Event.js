export default class Event {
    id;
    name;
    description;
    date;
    priceRange;
    images;
    classifications;

    constructor(eventId, name, description, date, priceRange, images = [], classifications = []) {
        this.id = eventId;
        this.name = name;
        this.description = description;
        this.date = date;
        this.priceRange = priceRange;
        this.images = images;
        this.classifications = classifications;
    }

    addClassification(classification) {
        this.classifications.push(classification);
    }

    removeClassification(classification) {
        this.classifications = this.classifications.filter(other => other.id !== classification.id);
    }

    setPriceRange(currency, min, max = min) {
        this.priceRange['currency'] = currency;
        this.priceRange['min'] = min;
        this.priceRange['max'] = max;
    }
}
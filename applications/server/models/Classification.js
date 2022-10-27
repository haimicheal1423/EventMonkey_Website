export class Classification {
    id;
    segment;
    genre;
    subgenre;

    constructor(classId, segment, genre, subgenre) {
        this.id = classId;
        this.segment = segment;
        this.genre = genre;
        this.subgenre = subgenre;
    }
}
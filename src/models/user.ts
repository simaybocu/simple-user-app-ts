//bir nesnenin fieldlarına nesne üretimi esnasında varsayılan değerleri constructer aracılığıyla atanır
export default class User {
    constructor(public id: number, public username: string, public email: string, public age?: number) {}
}
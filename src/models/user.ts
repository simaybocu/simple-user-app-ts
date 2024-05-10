//bir nesnenin fieldlarına nesne üretimi esnasında varsayılan değerleri constructor aracılığıyla atanır
export interface User {
    id: number;
    username: string;
    email: string;
    age?: number;
}
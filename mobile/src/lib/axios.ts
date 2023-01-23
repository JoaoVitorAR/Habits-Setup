import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://10.0.0.158:3333'
    //baseURL: 'http://yg1ybt4.joaovitoralves.19000.exp.direct:3333'
    //baseURL:   'http://192.168.1.103:3333'
})
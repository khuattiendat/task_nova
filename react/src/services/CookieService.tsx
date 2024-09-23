import Cookies from "universal-cookie";

const cookie = new Cookies();

class CookieService{
    get(key: string){
        return cookie.get(key);
    }

    set(key: string , value: string ,options: Object){
        cookie.set(key,value,options);
    }
}

export default new CookieService();
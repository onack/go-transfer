import {Storage, LocalStorage} from "ionic-angular";
import {Injectable} from "@angular/core";

@Injectable()
export class StorageService {

    private local: LocalStorage;

    constructor() {
        this.local = new Storage(LocalStorage);
    }

    getObject(key) {
        return this.local.get(key)
            .then(res => {
                if (!res || res === "undefined")
                    return Promise.reject(res);
                return Promise.resolve(JSON.parse(res));
            });
    };

    setObject(key, value) {
        return this.local.set(key, JSON.stringify(value));
    };

    remove(key) {
        return this.local.remove(key);
    };
}

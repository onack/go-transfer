import {Injectable} from "@angular/core";
import "rxjs/add/operator/map";
import "rxjs/add/operator/timeout";
import "rxjs/add/operator/retry";
import {StorageService} from "./storage.service";

@Injectable()
export class DataService {

    constructor(private storage: StorageService) {
    }

}


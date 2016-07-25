import * as request from "request";
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs/Rx";
import {Injectable} from "@angular/core";

@Injectable()
export class ApiHandler {
    private static _request;

    constructor(private http: Http) {
    }

    public static get request() {
        if (ApiHandler._request)
            return ApiHandler._request;

        let jar = request.jar();
        ApiHandler._request = request.defaults({jar});

        return ApiHandler._request;
    }

    get(url, header): Observable<Response> {
        return this.http.get(url, {
            headers: header
        });
    };

    post(url, body, header): Observable<Response> {
        return this.http.post(url, body, {
            headers: header
        });
    };
}

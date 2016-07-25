import {User} from "../interfaces";
import {Injectable} from "@angular/core";
const GoogleOAuth = require("gpsoauthnode");

const android_id = "9774d56d682e549c";
const oauth_service = "audience:server:client_id:848232511240-7so421jotr2609rmqakceuu1luuq0ptb.apps.googleusercontent.com";
const app = "com.nianticlabs.pokemongo";
const client_sig = "321187995bc7cdc2b5fc91b11a96e2baa8602c62";

@Injectable()
export class GoogleAuthHandler {
    private googleOAuth;

    constructor() {
        this.googleOAuth = new GoogleOAuth();
    }

    public authenticate(user: User): Promise<string> {
        return this.makeLoginRequest(user).then((loginResult: any) => {
            return this.makeOAuthRequest(user.username, loginResult.masterToken, loginResult.androidId);
        });
    }

    private makeLoginRequest(user) {
        return new Promise((resolve, reject) => {
            this.googleOAuth.login(user.username, user.pass, android_id, (err, data) => {
                if (err)
                    throw err;

                resolve(data);
            });

        });
    }

    private makeOAuthRequest(user, masterToken, androidId) {
        return new Promise((resolve, reject) => {
            this.googleOAuth.oauth(user, masterToken, androidId, oauth_service, app, client_sig, (err, data) => {
                if (err)
                    throw err;

                resolve(data.Auth);
            });

        });
    }
}

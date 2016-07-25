import {ApiHandler} from "../io/handlers/ApiHandler";
import {User} from "../interfaces";
import {Injectable} from "@angular/core";
// const login_url = "https://sso.pokemon.com/sso/login?service=https%3A%2F%2Fsso.pokemon.com%2Fsso%2Foauth2.0%2FcallbackAuthorize";
const login_url = "https://sso.pokemon.com/sso/login?service=https://sso.pokemon.com/sso/oauth2.0/callbackAuthorize";

const login_oauth = "https://sso.pokemon.com/sso/oauth2.0/accessToken";

@Injectable()
export class PokemonClubAuthHandler {

    constructor(private api: ApiHandler) {
    }

    public authenticate(user: User): Promise<string> {
        return this.makeLoginGetRequest().then((data: any) => {
            return this.getAuthTicket(data, user);
        }).then(ticket => {
            return this.getOAuthToken(ticket);
        });

    }

    private makeLoginGetRequest() {
        return new Promise((resolve, reject) => {

            let options = {
                url: login_url,
                headers: {
                    "User-Agent": "niantic"
                }
            } as any;

            console.log("Making login request");
            ApiHandler.request.get(options, (err, response, body) => {
                console.log("Body from login request", body);

                if (err)
                    throw err;

                // Parse body if any exists, callback with errors if any.
                if (body) {
                    let parsedBody = JSON.parse(body);
                    if (parsedBody.errors && parsedBody.errors.length !== 0) {
                        throw new Error(`Error logging in: ${parsedBody.errors[0]}`);
                    }

                    resolve(parsedBody);
                }
            });

        });
    }

    private getAuthTicket(data, user: User) {
        return new Promise((resolve, reject) => {

            let body = {
                "lt": data.lt,
                "execution": data.execution,
                "_eventId": "submit",
                "username": user.username,
                "password": user.pass
            } as any;
            let header = {
                "User-Agent": "Niantic App"
            } as any;
            console.log("Getting auth ticket");
            this.api.post(login_url, body, header).subscribe((response: any) => {
                console.log("Header from ticket location", response);

                if (response.err)
                    throw response.err;

                // Parse body if any exists, callback with errors if any.
                if (body) {
                    let parsedBody = JSON.parse(response);
                    if (parsedBody.errors && parsedBody.errors.length !== 0) {
                        throw new Error(`Error logging in: ${parsedBody.errors[0]}`);
                    }
                }

                let ticket = response.headers["location"].split("ticket=")[1];

                resolve(ticket);
            });

        });
    }

    private getOAuthToken(ticket) {
        return new Promise((resolve, reject) => {

            let options = {
                url: login_oauth,
                form: {
                    client_id: "mobile-app_pokemon-go",
                    redirect_uri: "https://www.nianticlabs.com/pokemongo/error",
                    client_secret: "w8ScCUXJQc6kXKw8FiOhd8Fixzht18Dq3PEVkUCP5ZPxtgyWsbTvWHFLm2wNY0JR",
                    grant_type: "refresh_token",
                    code: ticket
                },
                headers: {
                    "User-Agent": "niantic"
                }
            } as any;
            console.log("Getting OAuthToken");
            ApiHandler.request.post(options, (err, response, body) => {
                console.log("Body from OAuthToken", body);
                if (err)
                    throw err;

                let token = body.split("token=")[1];
                token = token.split("&")[0];

                if (!token)
                    throw new Error("Login failed");

                resolve(token);
            });

        });
    }
}

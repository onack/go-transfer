import {PokemonClubAuthHandler} from "./PokemonClubAuthHandler";
import {GoogleAuthHandler} from "./GoogleAuthHandler";
import {User} from "../interfaces";
import {Injectable} from "@angular/core";

@Injectable()
export class Auth {
    constructor(private ptch: PokemonClubAuthHandler,
                private goog: GoogleAuthHandler) {
    }

    public getAccessToken(user: User): Promise<string> {
        console.log("Logging in with user: ", user);

        if (user.authType === "ptc") {
            return this.loginWithPokemonClub(user);
        }
        else if (user.authType === "google") {
            return this.loginWithGoogle(user);
        }

        return null;
    };

    public loginWithPokemonClub(user: User) {
        return this.ptch.authenticate(user);
    }

    public loginWithGoogle(user: User) {
        return this.goog.authenticate(user);
    }
}

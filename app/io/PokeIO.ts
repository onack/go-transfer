import {PokeIOBase} from "./PokeIOBase";
import {PlayerProfile} from "../models/PlayerProfile";

export class PokeIO extends PokeIOBase {
    public getProfile(): Promise<PlayerProfile> {
        let request = [
            new this.requestEnvelope.Requests(2)
        ];

        return this.makeApiRequest(this.player.apiEndpoint, request).then((apiResponse: any) => {

            let responseProfile = this.responseEnvelope.ProfilePayload.decode(apiResponse.payload[0]).profile;

            console.log("Logged in!");

            let profile = new PlayerProfile();

            profile.username = responseProfile.username;
            profile.team = responseProfile.team;
            profile.tutorial = responseProfile.tutorial;
            profile.avatar = responseProfile.avatar;

            profile.storage.pokemon = responseProfile.poke_storage;
            profile.storage.items = responseProfile.item_storage;
            profile.pokecoins = responseProfile.currency[0].amount;
            profile.stardust = responseProfile.currency[1].amount;

            return profile;
        });
    };
}

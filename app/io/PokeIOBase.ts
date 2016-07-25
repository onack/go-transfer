import {ProtoBuilder} from "../proto/ProtoBuilder";
import {Player} from "../models/Player";
import {Auth} from "../auth/Auth";
import {Constants} from "./Constants";
import {ApiHandler} from "./handlers/ApiHandler";
import {User} from "../interfaces";

export abstract class PokeIOBase {
    public player: Player;

    public requestEnvelope;
    public responseEnvelope;

    constructor(private auth: Auth) {
        this.player = new Player();


    }

    public init(user: User, location: string) {

        // Set provider
        this.player.provider = user.authType;

        return ProtoBuilder.buildPokemonProto().then((ret: any) => {
            this.requestEnvelope = ret.request;
            this.responseEnvelope = ret.response;

            return this.auth.getAccessToken(user);

        }).then((ret: any) => {
            this.player.accessToken = <string>ret;

            return this.getApiEndpoint();
            // GeocoderHelper.resolveLocationByName(location)
        }).then((ret: any) => {
            this.player.apiEndpoint = <string>ret;
            // this.player.location = ret[2];
        }).catch((e) => {
            console.log("Failed when initializing", e);
        });
    }

    public getApiEndpoint(): Promise<string> {
        let requestEnvelope = this.requestEnvelope;

        let requests = [
            new requestEnvelope.Requests(2),
            new requestEnvelope.Requests(126),
            new requestEnvelope.Requests(4),
            new requestEnvelope.Requests(129),
            new requestEnvelope.Requests(5)
        ];

        return this.makeApiRequest(Constants.API_URL, requests).then((apiResponse: any) => {
            let endpoint = `https://${apiResponse.api_url}/rpc`;

            console.log("Received API Endpoint: " + endpoint);

            return endpoint;
        });


    };

    public makeApiRequest(endpoint: string, requests: any[]) {
        return new Promise((resolve, reject) => {

            // Auth
            let auth = new this.requestEnvelope.AuthInfo({
                provider: this.player.provider,
                token: new this.requestEnvelope.AuthInfo.JWT(this.player.accessToken, 59)
            });

            let request = new this.requestEnvelope({
                requests: requests,

                latitude: this.player.location.latitude,
                longitude: this.player.location.longitude,

                unknown1: 2,
                rpc_id: 1469378659230941192,

                auth: auth,
                unknown12: 989
            });

            let protobuf = request.encode().toBuffer();

            let options = {
                url: endpoint,
                body: protobuf,
                encoding: null,
                headers: {
                    "User-Agent": "Niantic App"
                }
            } as any;

            ApiHandler.request.post(options, (err, response, body) => {
                if (!response || !body) {
                    console.log("RPC Server offline");

                    throw new Error("RPC Server offline");
                }

                try {
                    let decodedResponse = this.responseEnvelope.decode(body);

                    resolve(decodedResponse);
                } catch (e) {
                    if (e.decoded) {
                        console.log(e);
                        resolve(e.decoded);
                    }
                }
            });

        });
    }

    public abstract getProfile();
}

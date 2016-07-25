import * as protobuf from "protobufjs";
import path = require("path");

const pathToProtoFile = path.join("build/js/pokemon.proto");

export class ProtoBuilder {
    public static buildPokemonProto() {
        return new Promise((resolve, reject) => {
            let builder = <any>protobuf.loadProtoFile(pathToProtoFile);
            let pokemonProto = builder.build() as any;
            resolve({
                request: pokemonProto.RequestEnvelop,
                response: pokemonProto.ResponseEnvelop
            });
        });
    }
}

import {ionicBootstrap, Platform} from "ionic-angular";
import {Component} from "@angular/core";
import {Splashscreen, StatusBar} from "ionic-native";
import {Home} from "./pages/home/home";
import {StorageService} from "./services/storage.service";
import {DataService} from "./services/data.service";
import {FORM_DIRECTIVES} from "@angular/common";
import {Login} from "./pages/login/login";
import {Auth} from "./auth/Auth";
import {PokemonClubAuthHandler} from "./auth/PokemonClubAuthHandler";
import {ApiHandler} from "./io/handlers/ApiHandler";
import {GoogleAuthHandler} from "./auth/GoogleAuthHandler";

@Component({
    templateUrl: 'build/app.html',
    directives: [FORM_DIRECTIVES]
})
export class App {

    public rootPage: any = Login;
    public events: any;


    constructor(private platform: Platform,
                private storage: StorageService) {

        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready()
            .then(() => {
                StatusBar.styleDefault();

                this.storage.getObject('session')
                    .then(session => {
                        if (!session) {
                            console.log("Error loading session, going to login");
                            this.rootPage = Login;
                        }
                        console.log("Session loaded, going to home", session);
                        this.rootPage = Home;
                    }).catch(err => {
                    console.log("No session, going to login", err);
                    // Showing login
                    this.rootPage = Login;
                }).then(() => Splashscreen.hide()
                );
            });
    }
}

ionicBootstrap(App, [StorageService, DataService, Auth, PokemonClubAuthHandler, ApiHandler, GoogleAuthHandler], {});

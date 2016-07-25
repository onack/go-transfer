import {NavController, NavParams} from "ionic-angular";
import {ViewChild, Component} from "@angular/core";
import {PokeIO} from "../../io/PokeIO";

@Component({
    templateUrl: 'build/pages/home/home.html',
})
export class Home {
    @ViewChild('home') home;
    private io: PokeIO;


    constructor(public nav: NavController,
                private navParams: NavParams) {
        this.io = navParams.data.pokeio;
    }

    ionViewWillEnter() {
    }

    ionViewDidEnter() {
        // Get inventory

        this.io.getProfile().then(profile => {
            console.log(profile);
        });
    }


}

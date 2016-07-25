import {Component} from "@angular/core";
import {NavController} from "ionic-angular";
import {FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators, AbstractControl} from "@angular/common";
import {CustomValidators} from "../validators/CustomValidators";
import {User} from "../../interfaces";
import {StorageService} from "../../services/storage.service";
import {Home} from "../home/home";
import {PokeIO} from "../../io/PokeIO";
import {Auth} from "../../auth/Auth";


@Component({
    templateUrl: 'build/pages/login/login.html',
    directives: [FORM_DIRECTIVES]
})

export class Login {

    authForm: ControlGroup;
    username: AbstractControl;
    password: AbstractControl;
    private authType = "ptc";
    private error;

    constructor(private navController: NavController,
                private fb: FormBuilder,
                private storage: StorageService,
                private auth: Auth) {
        this.authForm = fb.group({
            'username': ['', Validators.compose([Validators.required, Validators.minLength(3), CustomValidators.checkFirstCharacterValidator])],
            'password': ['', Validators.compose([Validators.required, Validators.minLength(3), CustomValidators.checkFirstCharacterValidator])]
        });

        this.username = this.authForm.controls['username'];
        this.password = this.authForm.controls['password'];
    }

    onSubmit(value: any): void {
        this.error = null;
        if (this.authForm.valid) {
            console.log('Submitted value: ', value);
            let user = {
                username: value.username,
                pass: value.password,
                session: null,
                authType: this.authType
            } as User;
            let io = new PokeIO(this.auth);

            // We dont need location for now, keeping it null
            io.init(user, null).then(ret => {
                let accessToken = ret[0];
                // Assume we have token, store it and navaigate to home
                this.storage.setObject("session", accessToken).then(() => {
                    this.navController.push(Home, {pokeio: io});
                });
            }).catch((e) => {
                console.log("Failed when initializing", e);
            });

        }
    }

    authSelect(value: string): void {
        this.authType = value;
        console.log('Radio value: ', value);
    }
}

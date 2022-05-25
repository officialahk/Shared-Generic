import { Injectable } from '@angular/core'
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { JwtHelperService } from '@auth0/angular-jwt';

import decode from 'jwt-decode';
import { AuthenticatedUser } from 'src/models/user';
import { AuthenticationService } from 'src/services/authenticationservice';
import { Constants } from './Constants';
import { GuardHelper } from './GuardHelper';
@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private jwtHelper: JwtHelperService, 
        public auth: AuthenticationService, 
        public router: Router) { }
    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        // this will be passed from the route config
        // on the data property
        return true;
        const routeHelper = new GuardHelper();
        const expectedRole = route.data.expectedRole;
        const token = localStorage.getItem(Constants.StorageKey);

        if (token == null) {
            this.router.navigate(['login']);
            return false;
        }
        if (!this.auth.isAuthenticated()) {
            console.log('token expires')
            await this.GetRefreshedToken().then((User) => {
                console.log('token refreshed')
            }, rejected => {
                console.log('rejectedddd')
                this.router.navigate(['login']);
                return false;
            })
        }
        return true;

        // const currentUserKey = this.auth.isAuthenticated();
        // if (currentUserKey !== null) {
            // logged in so return true
        //     console.log(true);
        //     return true;
        // }
        // not logged in so redirect to login page with the return url
        // await this.router.navigate(['/login'], {queryParams: {returnUrl: state.url}});
        // return false;

    }


    GetRefreshedToken(): Promise<AuthenticatedUser> {
        return new Promise((resolve, reject) => {
            this.auth.ExchangeRefreshToken().subscribe(res => {
                resolve(res);
            }, err => {
                reject()
            })
        })
    }

}
import { EpConfig } from './../helpers/ep-config';
// import { RegisterUser } from 'src/models/user';
import { Injectable } from '@angular/core'
import { District } from '../models/districts';

import { HttpErrorResponse, HttpClient, HttpHeaders, HttpRequest, HttpParams, HttpResponse, HttpBackend } from '@angular/common/http';
import { UrlService } from './baseservice';
import { Observable, BehaviorSubject } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

import 'rxjs/operators';
import { map, catchError, tap } from 'rxjs/operators';
import {  AnonymousRequestViewModel, AuthenticatedUser, ConfirmEmail, ExchangeRefreshToken, ForgetPassword, LoginUser, RegisterUser, SetPassword } from '../models/user';
import { JsonPipe } from '@angular/common';
import { Router } from '@angular/router';
import {  Constants } from 'src/helpers/Constants';
@Injectable({

    providedIn: 'root'

})

export class AuthenticationService extends UrlService {
    error: HttpErrorResponse;
    private CurrentUser: AuthenticatedUser;

    constructor(private handler: HttpBackend, public router: Router,
        public jwtHelper: JwtHelperService, private httpClient: HttpClient) {
        super();

    }
    public isAuthenticated(): boolean {
        const token = localStorage.getItem(Constants.StorageKey);
        return !this.jwtHelper.isTokenExpired(token);
    }

    GetAuthenticatedUser(): Observable<AuthenticatedUser> {
        this.CurrentUser = new AuthenticatedUser();
        this.CurrentUser.Email = localStorage.getItem(Constants.Email);
        this.CurrentUser.UserName = localStorage.getItem(Constants.UserName);
        return new Observable<AuthenticatedUser>(observer => {
            observer.next(this.CurrentUser);
        });

    }
    Authenticate(model: LoginUser)
        : Observable<HttpResponse<AuthenticatedUser>> {
        console.log(this.authenticationUrl)
        const httpWithoutInterception = new HttpClient(this.handler);
        return httpWithoutInterception.post<AuthenticatedUser>(this.authenticationUrl, model, { observe: 'response' });
    }
    Register(model: any)
        : Observable<HttpResponse<string>> {
        console.log(this.registrationUrl)
        const httpWithoutInterception = new HttpClient(this.handler);
        return httpWithoutInterception.post<string>(this.registrationUrl, model, { observe: 'response' });
    }

    Login(model: LoginUser)
        : Observable<HttpResponse<AuthenticatedUser>> {
        console.log(this.loginUrl)
        const httpWithoutInterception = new HttpClient(this.handler);
        return httpWithoutInterception.post<AuthenticatedUser>(this.loginUrl, model, { observe: 'response' });
    }
    
    ExchangeRefreshToken(): Observable<AuthenticatedUser> {
        const http = new HttpClient(this.handler);
        return http.post<any>(this.ExchangeRefreshTokenUrl, this.getExchangeTokenObject())
            .pipe(tap((User: AuthenticatedUser) => {
                this.storeTokenObject(User);
            }));
    }
    ConfirmEmail(model: ConfirmEmail): Observable<HttpResponse<string>> {
        const httpWithoutInterception = new HttpClient(this.handler);
        return httpWithoutInterception.post<string>(this.confirmEmailUrl, model, { observe: 'response' });
    }
    ForgetPassword(model: ForgetPassword)
        : Observable<HttpResponse<string>> {
        console.log(this.forgetPasswordUrl)
        const httpWithoutInterception = new HttpClient(this.handler);
        return httpWithoutInterception.post<string>(this.forgetPasswordUrl, model, { observe: 'response' });
    }
    SetPassword(model: SetPassword)
        : Observable<HttpResponse<string>> {
        console.log(this.setPasswordUrl)
        const httpWithoutInterception = new HttpClient(this.handler);
        return httpWithoutInterception.post<string>(this.setPasswordUrl, model, { observe: 'response' });
    }
    storeTokenObject(User: AuthenticatedUser) {
        localStorage.setItem(Constants.StorageKey, User.AuthToken.toString());
        localStorage.setItem(Constants.UserName, User.UserName.toString());
        localStorage.setItem(Constants.Email, User.Email.toString());
        localStorage.setItem(Constants.RefreshToken, User.RefreshToken.toString());
        // store token
    }
    getJwtToken() {
        return localStorage.getItem(Constants.StorageKey);
    }
    getExchangeTokenObject(): ExchangeRefreshToken {
        const exchangeRefreshToken = new ExchangeRefreshToken();
        exchangeRefreshToken.AuthToken = localStorage.getItem(Constants.StorageKey);
        exchangeRefreshToken.UserName = localStorage.getItem(Constants.UserName);
        exchangeRefreshToken.Email = localStorage.getItem(Constants.Email);
        exchangeRefreshToken.RefreshToken = localStorage.getItem(Constants.RefreshToken);
        return exchangeRefreshToken;
    }
    logout() {
        localStorage.removeItem(Constants.StorageKey);
        this.router.navigateByUrl('/login');
    }
}

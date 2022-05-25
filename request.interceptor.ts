import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';


import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { UrlService } from '../services/baseservice';
import { AuthenticationService } from 'src/services/authenticationservice';
import { Router } from '@angular/router';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthenticatedUser } from 'src/models/user';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<AuthenticatedUser>(null);
  constructor(public auth: AuthenticationService, public router: Router, private urlservice: UrlService) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request);
    if (this.auth.getJwtToken()) {
      console.log('adding')
      request = this.addToken(request, this.auth.getJwtToken());
    }
    return next.handle(request).pipe(catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        console.log('error 401')
        return this.handle401Error(request, next);
      } else {
        return throwError(error);
      }
    }));
  }
  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    console.log('handling error')
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      console.log('already refreshing token')
      return this.auth.ExchangeRefreshToken().pipe(
        switchMap((token: AuthenticatedUser) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token);
          return next.handle(this.addToken(request, token.AuthToken));
        }));

    } else {
      console.log('refreshing token')
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next.handle(this.addToken(request, jwt.AuthToken));
        }));
    }
  }
  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ` + token
      }
    });
  }
}
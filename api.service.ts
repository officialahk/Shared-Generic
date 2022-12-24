import { EpConfig } from './ep-config';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    headers: HttpHeaders = new HttpHeaders(); // You can also set & use your headers here according to your need!

    constructor(private httpClient: HttpClient) {
    }

    public HttpPost(controller: string, action: string, obj: any) {
        return this.httpClient.post(`${EpConfig.getControllerUrl(`${controller}`, `${action}`)}`, obj, { headers: this.headers });
    }

    public HttpPut(controller: string, action: string, obj: any) {
        return this.httpClient.put(`${EpConfig.getControllerUrl(`${controller}`, `${action}`)}`, obj, { headers: this.headers });
    }

    // Get Request without payload object
    public Get(controller: string, action: string): Observable<any> {
        return this.httpClient.get(`${EpConfig.getControllerUrl(`${controller}`, `${action}`)}`, { headers: this.headers });
    }

    // Get Request with payload object
    public HttpGet(controller: string, action: string, obj: any) {
        return this.httpClient.get(`${EpConfig.getControllerUrl(`${controller}`, `${action}`)}`, obj);
    }

}
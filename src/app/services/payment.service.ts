import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Payment } from '../models/payment';
import { GLOBAL } from './GLOBAL';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {

    public url: string;

    constructor(private _http: HttpClient) {
        this.url = GLOBAL.url;
    }

    getPayments(): Observable<Payment[]> {
        return this._http.get<Payment[]>(this.url + 'payments');
    }

    /** @GetMapping(ID_IN_PATH + "/payments/paged/{page}")*/
    getPaymentsByStudent(idStudent: string, page: number): Observable<any> {
        return this._http.get<any>(`${this.url}students/${idStudent}/payments/paged/${page}`);
    }

    createPayment(payload: Payment): Observable<Payment> {
        return this._http.post<Payment>(this.url + 'payments', payload);
    }

    updatePayment(payload: Payment): Observable<Payment> {
        return this._http.put<Payment>(`${this.url}payments/${payload.idPayment}`, payload);
    }

    deletePayment(id: string): Observable<any> {
        return this._http.delete(`${this.url}payments/${id}`);
    }
}

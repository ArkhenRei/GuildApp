import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Country } from '../Models/country';

@Injectable({
  providedIn: 'root'
})
export class CountrystatecityService {

  constructor(private httpClient: HttpClient) { }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-type': 'application/json',
      'X-CSCAPI-KEY': 'bjd2S0g2cmhzdHpTMWVBNFVGYXlKblV2RUJXZENlM2RvZVZXV1pLSg=='
    })
  }

  getCountry(): Observable<Country[]>{
    return this.httpClient.get<Country[]>('https://api.countrystatecity.in/v1/countries', {headers: this.httpOptions.headers})
  }

  getStateOfSelectedCountry(countryIso: string): Observable<any>{
    return this.httpClient.get(`https://api.countrystatecity.in/v1/countries/${countryIso}/states`, {headers: this.httpOptions.headers})
  } 
}

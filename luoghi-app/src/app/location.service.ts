import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class LocationService {
  private username = 'alezanei04';

  constructor(private http: HttpClient) {}

  getSuggestions(query: string): Observable<string[]> {
    if (!query.trim()) return of([]);
    const url = `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(query)}&maxRows=5&username=${this.username}`;
    return this.http.get<any>(url).pipe(
      map(res => res.geonames.map((item: any) => `${item.name}, ${item.countryName}`))
    );
  }

  getLocationDetails(location: string): Observable<any> {
    const [city] = location.split(',').map(s => s.trim());
    const url = `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(city)}&maxRows=1&username=${this.username}`;
    return this.http.get<any>(url).pipe(
      map(res => {
        const place = res.geonames[0];
        return {
          name: `${place.name}, ${place.countryName}`,
          description: `Popolazione: ${place.population}, Lat: ${place.lat}, Lon: ${place.lng}`
        };
      })
    );
  }
}

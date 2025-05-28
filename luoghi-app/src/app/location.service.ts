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
        const population = new Intl.NumberFormat('en-US').format(place.population);
        return {
          name: `${place.name}, ${place.countryName}`,
          description: `Popolazione: ${population}, Lat: ${place.lat}, Lon: ${place.lng}`,
          raw: {
            name: place.name,
            country: place.countryName,
            lat: place.lat,
            lon: place.lng,
            population: place.population
          }
        };
      })
    );
  }

  private favorites: any[] = [];

  getFavorites(): Observable<any[]> {
    return of(this.favorites);
  }

  addFavorite(location: any): Observable<any> {
    const exists = this.favorites.some(
      fav => fav.name === location.name && fav.country === location.country
    );
    if (!exists) {
      this.favorites.push(location);
      return of(location); // Simulated POST
    } else {
      return of(null); // Nothing added
    }
  }


  deleteFavorite(index: number): Observable<void> {
    this.favorites.splice(index, 1);
    return of(); // simulazione di DELETE
  }

  updateFavorite(index: number, updated: any): Observable<any> {
    this.favorites[index] = updated;
    return of(updated); // simulazione di PUT/PATCH
  }


}

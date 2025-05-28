import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class LocationService {
  private username = 'alezanei04';
  private favorites: any[] = [];

  constructor(private http: HttpClient) {
    this.loadFavorites();
  }

  // Loads Favorites from localStorage
  private loadFavorites() {
    const data = localStorage.getItem('favorites');
    if (data) {
      this.favorites = JSON.parse(data);
    }
  }

  // Saves Favorites in localStorage
  private saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
  }

  // Suggestions
  getSuggestions(query: string): Observable<string[]> {
    if (!query.trim()) return of([]);
    const url = `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(query)}&maxRows=5&username=${this.username}`;
    return this.http.get<any>(url).pipe(
      map(res => res.geonames.map((item: any) => `${item.name}, ${item.countryName}`))
    );
  }

  // Place Details
  getLocationDetails(location: string): Observable<any> {
    const [city] = location.split(',').map(s => s.trim());
    const url = `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(city)}&maxRows=1&username=${this.username}`;
    return this.http.get<any>(url).pipe(
      map(res => {
        const place = res.geonames[0];
        const population = new Intl.NumberFormat('en-US').format(place.population);
        return {
          name: `${place.name}, ${place.countryName}`,
          description: `Population: ${population}, Lat: ${place.lat}, Lon: ${place.lng}`,
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

  // Obtain Favorites
  getFavorites(): Observable<any[]> {
    return of(this.favorites);
  }

  // Add Favorites
  addFavorite(location: any): Observable<any> {
    const exists = this.favorites.some(
      fav => fav.name === location.name
    );
    if (!exists) {
      this.favorites.push(location);
      this.saveFavorites();
      return of(location);
    } else {
      return of(null);
    }
  }



  // Delete Favotites
  deleteFavorite(index: number): Observable<void> {
    this.favorites.splice(index, 1);
    this.saveFavorites();
    return of();
  }

  // Update Favorites
  updateFavorite(index: number, updated: any): Observable<any> {
    this.favorites[index] = updated;
    this.saveFavorites();
    return of(updated);
  }

  getCountryDetails(countryName: string): Observable<any> {
    const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`;

    return this.http.get<any[]>(url).pipe(
      map(data => {
        const country = data[0];
        return {
          area: country.area, // superficie in km²
          languages: Object.values(country.languages || {}).join(', '),
          currency: Object.values(country.currencies || {})
            .map((c: any) => `${c.name} (${c.symbol})`)
            .join(', ')
        };
      })
    );
  }

}

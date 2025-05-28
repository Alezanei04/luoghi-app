import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, switchMap } from 'rxjs/operators';
import { LocationService } from './location.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  providers: [LocationService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private locationService = inject(LocationService);

  searchControl = new FormControl('');
  suggestions: string[] = [];
  selectedLocation: any = null;
  favorites: any[] = [];

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this.locationService.getSuggestions(value ?? ''))
      )
      .subscribe(data => {
        this.suggestions = data;
      });

    this.loadFavorites();
  }

  loadFavorites() {
    this.locationService.getFavorites().subscribe(favs => {
      this.favorites = favs;
    });
  }

  forceSelection() {
    const match = this.suggestions.find(s => s.toLowerCase() === this.searchControl.value?.toLowerCase());
    if (match) {
      this.locationService.getLocationDetails(match).subscribe(data => {
        this.selectedLocation = data;
      });
    } else {
      this.selectedLocation = null;
      this.searchControl.setValue('');
    }
  }

  addToFavorites() {
    if (!this.selectedLocation) return;

    const favToAdd = {
      name: this.selectedLocation.name,
      description: this.selectedLocation.description,
      population: this.selectedLocation.raw.population,
      lat: this.selectedLocation.raw.lat,
      lon: this.selectedLocation.raw.lon,
      note: this.selectedLocation.note || '',
      area: this.selectedLocation.area || null,
      languages: this.selectedLocation.languages || '',
      currency: this.selectedLocation.currency || ''
    };

    this.locationService.addFavorite(favToAdd).subscribe(added => {
      if (added) {
        this.loadFavorites();
      } else {
        alert('Location already in favorites!');
      }
    });
  }



  removeFavorite(index: number) {
    this.locationService.deleteFavorite(index).subscribe(() => {
      this.loadFavorites(); //reloads the list after deletion
    });
  }

  editFavorite(index: number) {
    const updated = {
      ...this.favorites[index],
      note: prompt("Add a note:", this.favorites[index].note || '')
    };
    this.locationService.updateFavorite(index, updated).subscribe(() => {
      this.loadFavorites(); // reloads the list after updating
    });
  }

  searchLocation() {
    const input = this.searchControl.value?.trim();
    const match = this.suggestions.find(
      s => s.toLowerCase() === input?.toLowerCase()
    );

    if (match) {
      this.locationService.getLocationDetails(match).subscribe(locationData => {
        this.selectedLocation = locationData;

        // fetch country-level details
        this.locationService.getCountryDetails(locationData.raw.country).subscribe(countryData => {
          this.selectedLocation = {
            ...this.selectedLocation,
            ...countryData // merges area, languages, currency
          };
        });
      });
    }

  }
}

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

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        switchMap(value => this.locationService.getSuggestions(value ?? ''))
      )
      .subscribe(data => {
        this.suggestions = data;
      });

      this.locationService.getFavorites().subscribe(favs => this.favorites = favs);
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

  favorites: any[] = [];

  addToFavorites() {
    if (this.selectedLocation) {
      this.locationService.addFavorite(this.selectedLocation.raw).subscribe(() => {
        // Ricarica la lista aggiornata dai preferiti dal backend
        this.locationService.getFavorites().subscribe(favs => this.favorites = favs);
      });
    }
  }

  removeFavorite(index: number) {
    this.locationService.deleteFavorite(index).subscribe(() => {
      this.favorites.splice(index, 1);
    });
  }

  editFavorite(index: number) {
    const updated = {
      ...this.favorites[index],
      note: prompt("Aggiungi una nota:", this.favorites[index].note || '')
    };
    this.locationService.updateFavorite(index, updated).subscribe(() => {
      this.favorites[index] = updated;
    });
  }

  searchLocation() {
    const input = this.searchControl.value?.trim();
    const match = this.suggestions.find(
      s => s.toLowerCase() === input?.toLowerCase()
    );

    if (match) {
      this.locationService.getLocationDetails(match).subscribe(data => {
        this.selectedLocation = data;
      });
    } else {
      this.selectedLocation = null;
      alert('Please select a valid location from the suggestions.');
    }
  }


}

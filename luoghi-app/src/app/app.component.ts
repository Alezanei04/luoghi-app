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
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ProductFormDialogComponent } from './product-form-dialog/product-form-dialog.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = false;
  searchControl = new FormControl('');
  selectedCategory = '';
  categories: string[] = [];

  constructor(
    private productService: ProductService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.applyFilters());
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        this.categories = [...new Set(products.map(p => p.category).filter(Boolean))];
        this.loading = false;
      },
      error: (err) => {
        this.snackBar.open('Failed to load products: ' + (err.message || 'Unknown error'), 'Close', { duration: 4000 });
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const search = (this.searchControl.value || '').toLowerCase();
    this.filteredProducts = this.products.filter(p => {
      const matchesSearch = !search ||
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search);
      const matchesCategory = !this.selectedCategory || p.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  openAddDialog(): void {
    const ref = this.dialog.open(ProductFormDialogComponent, {
      width: '500px',
      data: { product: null }
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.productService.createProduct(result).subscribe({
          next: () => {
            this.snackBar.open('Product created successfully!', 'Close', { duration: 3000 });
            this.loadProducts();
          },
          error: (err) => {
            this.snackBar.open('Failed to create product: ' + (err.error?.message || err.message || 'Unknown error'), 'Close', { duration: 4000 });
          }
        });
      }
    });
  }

  openEditDialog(product: Product): void {
    const ref = this.dialog.open(ProductFormDialogComponent, {
      width: '500px',
      data: { product }
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.productService.updateProduct(product.id, result).subscribe({
          next: () => {
            this.snackBar.open('Product updated successfully!', 'Close', { duration: 3000 });
            this.loadProducts();
          },
          error: (err) => {
            this.snackBar.open('Failed to update product: ' + (err.error?.message || err.message || 'Unknown error'), 'Close', { duration: 4000 });
          }
        });
      }
    });
  }

  deleteProduct(product: Product): void {
    if (!confirm(`Delete "${product.name}"? This action cannot be undone.`)) return;
    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.snackBar.open('Product deleted.', 'Close', { duration: 3000 });
        this.loadProducts();
      },
      error: (err) => {
        this.snackBar.open('Failed to delete product: ' + (err.error?.message || err.message || 'Unknown error'), 'Close', { duration: 4000 });
      }
    });
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.selectedCategory = '';
    this.filteredProducts = this.products;
  }
}

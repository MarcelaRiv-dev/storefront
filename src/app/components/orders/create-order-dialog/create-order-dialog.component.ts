import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { CreateOrderRequest } from '../../../models/order.model';

@Component({
  selector: 'app-create-order-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './create-order-dialog.component.html',
  styleUrls: ['./create-order-dialog.component.scss']
})
export class CreateOrderDialogComponent implements OnInit {
  form!: FormGroup;
  products: Product[] = [];
  loadingProducts = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateOrderDialogComponent>,
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      userId: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      shippingAddress: ['', Validators.required],
      items: this.fb.array([this.createItemGroup()])
    });

    this.loadProducts();
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  createItemGroup(): FormGroup {
    return this.fb.group({
      productId: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  addItem(): void {
    this.items.push(this.createItemGroup());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  loadProducts(): void {
    this.loadingProducts = true;
    this.productService.getProducts().subscribe({
      next: (prods) => {
        this.products = prods.filter(p => p.active && p.stockQuantity > 0);
        this.loadingProducts = false;
      },
      error: () => {
        this.loadingProducts = false;
      }
    });
  }

  getProductPrice(productId: string | number): number {
    const id = Number(productId);
    return this.products.find(p => p.id === id)?.price || 0;
  }

  getProductName(productId: string | number): string {
    const id = Number(productId);
    return this.products.find(p => p.id === id)?.name || '';
  }

  getRunningTotal(): number {
    return this.items.controls.reduce((sum, ctrl) => {
      const pid = ctrl.get('productId')?.value;
      const qty = ctrl.get('quantity')?.value || 0;
      return sum + this.getProductPrice(pid) * qty;
    }, 0);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const raw = this.form.value;
    const request: CreateOrderRequest = {
      userId: Number(raw.userId),
      shippingAddress: raw.shippingAddress,
      items: raw.items.map((item: { productId: string; quantity: number }) => ({
        productId: Number(item.productId),
        quantity: item.quantity
      }))
    };
    this.dialogRef.close(request);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

import { OrderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../models/order.model';
import { CreateOrderDialogComponent } from './create-order-dialog/create-order-dialog.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns = ['id', 'userId', 'status', 'totalAmount', 'itemCount', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Order>([]);
  loading = false;
  statusFilter = '';
  orderStatuses = Object.values(OrderStatus);
  allOrders: Order[] = [];

  constructor(
    private orderService: OrderService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.allOrders = orders;
        this.applyStatusFilter();
        this.loading = false;
        setTimeout(() => {
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        });
      },
      error: (err) => {
        this.snackBar.open('Failed to load orders: ' + (err.message || 'Unknown error'), 'Close', { duration: 4000 });
        this.loading = false;
      }
    });
  }

  applyStatusFilter(): void {
    if (this.statusFilter) {
      this.dataSource.data = this.allOrders.filter(o => o.status === this.statusFilter);
    } else {
      this.dataSource.data = this.allOrders;
    }
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(CreateOrderDialogComponent, {
      width: '600px',
      disableClose: false
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.orderService.createOrder(result).subscribe({
          next: () => {
            this.snackBar.open('Order created successfully!', 'Close', { duration: 3000 });
            this.loadOrders();
          },
          error: (err) => {
            this.snackBar.open('Failed to create order: ' + (err.error?.message || err.message || 'Unknown error'), 'Close', { duration: 4000 });
          }
        });
      }
    });
  }

  updateStatus(order: Order, status: OrderStatus): void {
    this.orderService.updateOrderStatus(order.id, { status }).subscribe({
      next: () => {
        this.snackBar.open(`Order status updated to ${status}`, 'Close', { duration: 3000 });
        this.loadOrders();
      },
      error: (err) => {
        this.snackBar.open('Failed to update status: ' + (err.error?.message || err.message || 'Unknown error'), 'Close', { duration: 4000 });
      }
    });
  }

  deleteOrder(order: Order): void {
    if (!confirm(`Delete order #${order.id}? This cannot be undone.`)) return;
    this.orderService.deleteOrder(order.id).subscribe({
      next: () => {
        this.snackBar.open('Order deleted.', 'Close', { duration: 3000 });
        this.loadOrders();
      },
      error: (err) => {
        this.snackBar.open('Failed to delete order: ' + (err.error?.message || err.message || 'Unknown error'), 'Close', { duration: 4000 });
      }
    });
  }

  getStatusClass(status: string): string {
    return 'status-' + status.toLowerCase();
  }

  getNextStatuses(current: OrderStatus): OrderStatus[] {
    const flow: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: []
    };
    return flow[current] || [];
  }
}

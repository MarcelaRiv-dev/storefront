import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { RegisterDialogComponent } from './register-dialog/register-dialog.component';

@Component({
  selector: 'app-users',
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
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns = ['id', 'username', 'email', 'role', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  loading = false;
  searchValue = '';

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users;
        this.loading = false;
        setTimeout(() => {
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.dataSource.filterPredicate = (u, f) =>
            u.username.toLowerCase().includes(f) ||
            u.email.toLowerCase().includes(f) ||
            u.role.toLowerCase().includes(f);
        });
      },
      error: (err) => {
        this.snackBar.open('Failed to load users: ' + (err.message || 'Unknown error'), 'Close', { duration: 4000 });
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchValue.trim().toLowerCase();
  }

  openRegisterDialog(): void {
    const ref = this.dialog.open(RegisterDialogComponent, {
      width: '450px'
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.userService.register(result).subscribe({
          next: () => {
            this.snackBar.open('User registered successfully!', 'Close', { duration: 3000 });
            this.loadUsers();
          },
          error: (err) => {
            this.snackBar.open('Failed to register user: ' + (err.error?.message || err.message || 'Unknown error'), 'Close', { duration: 4000 });
          }
        });
      }
    });
  }

  deleteUser(user: User): void {
    if (!confirm(`Delete user "${user.username}"? This cannot be undone.`)) return;
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.snackBar.open('User deleted.', 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (err) => {
        this.snackBar.open('Failed to delete user: ' + (err.error?.message || err.message || 'Unknown error'), 'Close', { duration: 4000 });
      }
    });
  }

  getRoleColor(role: string): string {
    const colors: Record<string, string> = {
      ADMIN: 'warn',
      USER: 'primary',
      MANAGER: 'accent'
    };
    return colors[role?.toUpperCase()] || 'primary';
  }
}

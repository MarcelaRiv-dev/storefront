import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  features = [
    {
      icon: 'people',
      title: 'Users',
      description: 'Manage user accounts, register new users, and control access roles.',
      link: '/users',
      color: '#3f51b5'
    },
    {
      icon: 'inventory_2',
      title: 'Products',
      description: 'Browse the product catalog, search by category, manage inventory and pricing.',
      link: '/products',
      color: '#009688'
    },
    {
      icon: 'shopping_cart',
      title: 'Orders',
      description: 'Track and manage customer orders, update statuses, and view order history.',
      link: '/orders',
      color: '#ff5722'
    }
  ];
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Order, CreateOrderRequest, UpdateOrderStatusRequest } from '../models/order.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly baseUrl = environment.apiUrls.orderService;

  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.userService.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/api/orders`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/api/orders/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getOrdersByUser(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/api/orders/user/${userId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  createOrder(req: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.baseUrl}/api/orders`, req, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  updateOrderStatus(id: number, req: UpdateOrderStatusRequest): Observable<Order> {
    return this.http.patch<Order>(`${this.baseUrl}/api/orders/${id}/status`, req, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/orders/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(err => throwError(() => err))
    );
  }
}

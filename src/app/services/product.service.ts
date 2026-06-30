import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Product, CreateProductRequest, UpdateProductRequest } from '../models/product.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly baseUrl = environment.apiUrls.productService;

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

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/api/products`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/api/products/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    const params = new HttpParams().set('category', category);
    return this.http.get<Product[]>(`${this.baseUrl}/api/products`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  searchProducts(query: string): Observable<Product[]> {
    const params = new HttpParams().set('search', query);
    return this.http.get<Product[]>(`${this.baseUrl}/api/products/search`, {
      headers: this.getAuthHeaders(),
      params
    }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  createProduct(req: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/api/products`, req, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  updateProduct(id: number, req: UpdateProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/api/products/${id}`, req, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(err => throwError(() => err))
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/products/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(err => throwError(() => err))
    );
  }
}

# SpecSync Demo Storefront

An Angular 17 frontend application for the SpecSync Demo microservices backend.

## Description

This application provides a complete storefront UI that connects to three backend microservices:
- **User Service**: Manages user accounts and authentication
- **Product Service**: Manages product catalog
- **Order Service**: Manages customer orders

## Prerequisites

- Node.js 18+
- npm 9+
- Angular CLI 17

## Installation

```bash
npm install
```

## Running the Application

```bash
npm start
```

The app will be available at http://localhost:4200

## Backend URLs

| Service | URL |
|---------|-----|
| User Service | http://localhost:8081 |
| Product Service | http://localhost:8082 |
| Order Service | http://localhost:8083 |

## Build

```bash
npm run build
```

Output will be in `dist/storefront/`.

## Features

- **Users**: Register, list, and manage users
- **Products**: Browse, search, filter, create, edit, and delete products
- **Orders**: Create and manage orders with line items
- **Login**: JWT-based authentication


# AllureModa API Documentation

This document provides a detailed overview of the AllureModa API endpoints.

## Base URL

The base URL for all API endpoints is:

```
http://localhost:3001/api
```

## Authentication

Authentication is handled via JWT (JSON Web Tokens) sent as `HttpOnly` cookies. To access protected routes, you must first authenticate using the `/auth/login` endpoint.

### Auth Endpoints

- `POST /auth/register`: Register a new user.
- `POST /auth/login`: Log in a user and receive an authentication cookie.
- `POST /auth/logout`: Log out a user and clear the authentication cookie.
- `GET /auth/me`: Get the currently authenticated user's information.

### Product Endpoints

- `GET /products`: Get a list of all products.
- `GET /products/:id`: Get a single product by its ID.
- `GET /products/slug/:slug`: Get a single product by its slug.

## Error Codes

- `400 Bad Request`: The request was invalid or cannot be otherwise served.
- `401 Unauthorized`: Authentication failed or was not provided.
- `403 Forbidden`: The authenticated user does not have permission to access the resource.
- `404 Not Found`: The requested resource could not be found.
- `500 Internal Server Error`: An unexpected error occurred on the server.

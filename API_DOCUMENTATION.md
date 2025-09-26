# 3D Printing Platform API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication via JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register
- **POST** `/auth/register`
- Body: `{ email, username, password, name? }`
- Response: `{ user, token }`

#### Login
- **POST** `/auth/login`
- Body: `{ emailOrUsername, password }`
- Response: `{ user, token }`

#### Logout
- **POST** `/auth/logout`
- Requires: Authentication
- Response: `{ message }`

#### Get Current User
- **GET** `/auth/me`
- Requires: Authentication
- Response: `{ user }`

### Models

#### Get All Models
- **GET** `/models?page=1&limit=12&search=query&userId=id`
- Optional: Authentication (for private models)
- Response: `{ models[], pagination }`

#### Get Single Model
- **GET** `/models/:id`
- Optional: Authentication
- Response: `{ model }`

#### Create Model
- **POST** `/models`
- Requires: Authentication
- Body: `{ title, description?, fileUrl, thumbnailUrl?, format, fileSize, tags?, isPublic }`
- Response: `{ model }`

#### Update Model
- **PATCH** `/models/:id`
- Requires: Authentication (owner only)
- Body: `{ title?, description?, tags?, isPublic? }`
- Response: `{ model }`

#### Delete Model
- **DELETE** `/models/:id`
- Requires: Authentication (owner only)
- Response: `{ message }`

#### Like/Unlike Model
- **POST** `/models/:id/like`
- Requires: Authentication
- Response: `{ liked: boolean }`

#### Add Comment
- **POST** `/models/:id/comments`
- Requires: Authentication
- Body: `{ content }`
- Response: `{ comment }`

### Users

#### Get User Profile
- **GET** `/users/:username`
- Response: `{ user }`

#### Update Profile
- **PATCH** `/users/profile`
- Requires: Authentication
- Body: `{ name?, bio?, avatar?, email?, password? }`
- Response: `{ user }`

#### Delete Account
- **DELETE** `/users/profile`
- Requires: Authentication
- Response: `{ message }`

### Upload

#### Upload File
- **POST** `/upload`
- Requires: Authentication
- Content-Type: `multipart/form-data`
- Body: FormData with `file` and optional `thumbnail`
- Response: `{ fileUrl, thumbnailUrl?, format, fileSize, fileName }`

## Error Responses

All error responses follow this format:
```json
{
  "error": "Error message",
  "details": {} // Optional validation errors
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## File Upload Limits
- Max file size: 100MB
- Allowed formats: STL, OBJ, GLB, GLTF, FBX, 3DS, PLY

## Rate Limiting
Currently no rate limiting is implemented. Consider adding this for production.

## CORS
CORS is enabled for all origins in development. Update for production use.

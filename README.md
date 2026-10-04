# Wallpaper API

A high-performance REST API designed to fetch and aggregate the top wallpaper image URLs from **Wallhaven**, **Unsplash**, and **DuckDuckGo Image Search** specifically optimized for Android APK & mobile client integration.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Local Installation](#local-installation)
  - [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
  - [1. Health Check (`GET /`)](#1-health-check-get-)
  - [2. Search Wallpapers (`GET /api/wallpapers`)](#2-search-wallpapers-get-apiwallpapers)
- [cURL & Testing Examples](#curl--testing-examples)
- [Android APK Integration Guide](#android-apk-integration-guide)
- [Render Deployment Guide](#render-deployment-guide)
  - [Option A: Automatic Blueprint Deployment (`render.yaml`)](#option-a-automatic-blueprint-deployment-renderyaml)
  - [Option B: Manual Web Service Creation](#option-b-manual-web-service-creation)
- [Project Structure](#project-structure)
- [License](#license)

---

## Overview

**Wallpaper API** provides a unified, reliable JSON endpoint for mobile application developers seeking high-resolution background images. Instead of querying individual wallpaper sources separately, this API concurrently searches multiple providers (**Wallhaven**, **Unsplash**, and **DuckDuckGo**), interleaves the results in round-robin fashion, sorts by resolution quality, and removes duplicates automatically.

---

## Key Features

- **Multi-Provider Aggregation**: Simultaneously fetches wallpapers from Wallhaven, Unsplash, and DuckDuckGo.
- **Round-Robin Interleaving**: Ensures diverse source distribution in the returned results.
- **Resolution Quality Prioritization**: Sorts images by total pixel resolution ($width \times height$).
- **URL Deduplication**: Normalizes URLs to eliminate duplicate image listings.
- **Resilient Fallbacks**: Gracefully continues returning valid wallpapers even if one provider fails or hits rate limits.
- **Android Ready**: Fully formatted JSON output ready for consumption by Retrofit, Ktor, Coil, or Glide.

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)

### Local Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sanyam7821/Wallpaper-Api.git
   cd Wallpaper-Api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. **Start the API server**:
   - **Production Mode**:
     ```bash
     npm start
     ```
   - **Development Mode** (with hot reload):
     ```bash
     npm run dev
     ```

   The server will start at `http://localhost:3000`.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | Port number on which the Express server listens. |
| `NODE_ENV` | No | `development` | Application environment (`development` or `production`). |
| `UNSPLASH_ACCESS_KEY` | No | - | Optional Unsplash API Access Key for higher rate limits. |

---

## API Documentation

### 1. Health Check (`GET /`)

Verifies that the backend service is running and operational.

- **URL**: `/`
- **Method**: `GET`
- **Access**: Public

#### Response (200 OK)
```json
{
  "status": "ok",
  "message": "Wallpaper API is running"
}
```

---

### 2. Search Wallpapers (`GET /api/wallpapers`)

Aggregates high-resolution wallpapers matching a given search query.

- **URL**: `/api/wallpapers`
- **Method**: `GET`
- **Access**: Public

#### Query Parameters

| Parameter | Type | Required | Default | Max | Description |
|---|---|---|---|---|---|
| `query` or `q` | String | **Yes** | - | - | Search term (e.g., `gojo wallpaper`, `anime wallpaper`, `cyberpunk`). |
| `limit` | Integer | No | `30` | `100` | Maximum number of wallpaper objects to return. |

---

#### Error Responses

##### Missing Query Parameter (400 Bad Request)
Returned when neither `query` nor `q` is provided in the request URL.

```json
{
  "success": false,
  "error": "Query parameter 'query' or 'q' is required (e.g. /api/wallpapers?query=gojo wallpaper)"
}
```

---

#### Response Schema

| Field | Type | Description |
|---|---|---|
| `success` | Boolean | `true` if the request succeeded. |
| `query` | String | The normalized search query processed by the API. |
| `count` | Integer | Total number of wallpaper items returned. |
| `data` | Array | Array of wallpaper objects (detailed below). |

##### Wallpaper Object Schema

| Field | Type | Description |
|---|---|---|
| `id` | String | Unique item identifier prefixed by source (e.g., `wallhaven_y8xmok`). |
| `title` | String | Title or description of the wallpaper image. |
| `url` | String | Direct URL to the high-resolution image file. |
| `thumbnail` | String | URL to a smaller preview thumbnail. |
| `width` | Integer | Image width in pixels. |
| `height` | Integer | Image height in pixels. |
| `source` | String | Source provider (`wallhaven`, `unsplash`, or `duckduckgo`). |

---

#### Real Example Output for `"gojo wallpaper"`

```http
GET /api/wallpapers?query=gojo%20wallpaper&limit=30
HTTP/1.1 200 OK
Content-Type: application/json
```

```json
{
  "success": true,
  "query": "gojo wallpaper",
  "count": 30,
  "data": [
    {
      "id": "wallhaven_y8xmok",
      "title": "gojo wallpaper (y8xmok)",
      "url": "https://w.wallhaven.cc/full/y8/wallhaven-y8xmok.jpg",
      "thumbnail": "https://th.wallhaven.cc/lg/y8/y8xmok.jpg",
      "width": 5679,
      "height": 3761,
      "source": "wallhaven"
    },
    {
      "id": "wallhaven_g788ld",
      "title": "gojo wallpaper (g788ld)",
      "url": "https://w.wallhaven.cc/full/g7/wallhaven-g788ld.jpg",
      "thumbnail": "https://th.wallhaven.cc/lg/g7/g788ld.jpg",
      "width": 4724,
      "height": 3754,
      "source": "wallhaven"
    },
    {
      "id": "wallhaven_l38mpr",
      "title": "gojo wallpaper (l38mpr)",
      "url": "https://w.wallhaven.cc/full/l3/wallhaven-l38mpr.png",
      "thumbnail": "https://th.wallhaven.cc/lg/l3/l38mpr.jpg",
      "width": 5333,
      "height": 3000,
      "source": "wallhaven"
    }
  ]
}
```

---

## cURL & Testing Examples

### Health Check Endpoint
```bash
curl -X GET "http://localhost:3000/"
```

### Search with `query` Parameter
```bash
curl -X GET "http://localhost:3000/api/wallpapers?query=gojo%20wallpaper&limit=30"
```

### Search with `q` Alias Parameter
```bash
curl -X GET "http://localhost:3000/api/wallpapers?q=anime%20wallpaper&limit=30"
```

### Validation Error Test (Missing Parameter)
```bash
curl -X GET "http://localhost:3000/api/wallpapers"
```

---

## Android APK Integration Guide

To consume the Wallpaper API in an Android application using **Retrofit** and **Coil** (in Kotlin):

### 1. Data Models (`WallpaperResponse.kt`)

```kotlin
import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class WallpaperResponse(
    @Json(name = "success") val success: Boolean,
    @Json(name = "query") val query: String,
    @Json(name = "count") val count: Int,
    @Json(name = "data") val data: List<WallpaperItem>
)

@JsonClass(generateAdapter = true)
data class WallpaperItem(
    @Json(name = "id") val id: String,
    @Json(name = "title") val title: String,
    @Json(name = "url") val url: String,
    @Json(name = "thumbnail") val thumbnail: String,
    @Json(name = "width") val width: Int,
    @Json(name = "height") val height: Int,
    @Json(name = "source") val source: String
)
```

### 2. Retrofit API Service (`WallpaperApiService.kt`)

```kotlin
import retrofit2.http.GET
import retrofit2.http.Query

interface WallpaperApiService {
    @GET("api/wallpapers")
    suspend fun searchWallpapers(
        @Query("query") query: String,
        @Query("limit") limit: Int = 30
    ): WallpaperResponse
}
```

### 3. Jetpack Compose UI Display (`WallpaperGrid.kt`)

```kotlin
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage

@Composable
fun WallpaperGrid(
    wallpapers: List<WallpaperItem>,
    modifier: Modifier = Modifier
) {
    LazyVerticalGrid(
        columns = GridCells.Adaptive(minSize = 160.dp),
        modifier = modifier
    ) {
        items(wallpapers, key = { it.id }) { item ->
            AsyncImage(
                model = item.thumbnail,
                contentDescription = item.title,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}
```

---

## Render Deployment Guide

Deploy your Wallpaper API service to [Render](https://render.com/) seamlessly using either automatic blueprint or manual configuration.

### Option A: Automatic Blueprint Deployment (`render.yaml`)

This project includes a pre-configured `render.yaml` file for 1-click deployment.

1. Push your repository to GitHub: `sanyam7821/Wallpaper-Api`.
2. Log in to your [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** and select **Blueprint**.
4. Connect your GitHub repository `sanyam7821/Wallpaper-Api`.
5. Render will automatically detect `render.yaml` and configure the web service:
   - **Service Name**: `wallpaper-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Port**: `10000`
   - **NODE_ENV**: `production`
6. Click **Apply** to launch the deployment.

---

### Option B: Manual Web Service Creation

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Select **Build and deploy from a Git repository**.
4. Connect the GitHub repository `sanyam7821/Wallpaper-Api`.
5. Fill in the following settings:
   - **Name**: `wallpaper-api`
   - **Region**: Select your preferred region (e.g., Oregon, USA or Frankfurt, Germany)
   - **Branch**: `main`
   - **Root Directory**: *(Leave blank)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
6. Expand **Advanced** -> **Environment Variables** and add:
   - `PORT`: `10000`
   - `NODE_ENV`: `production`
   - `UNSPLASH_ACCESS_KEY`: *(Optional access key)*
7. Click **Create Web Service**. Render will build and deploy your API automatically.

---

## Project Structure

```
wallpaper-api/
├── .env.example              # Sample environment variables
├── Dockerfile                # Docker container configuration
├── render.yaml               # Render Blueprint deployment definition
├── package.json              # Node.js dependencies and scripts
├── src/
│   ├── app.js                # Express app setup & middleware
│   ├── server.js             # HTTP server entry point
│   ├── controllers/
│   │   └── wallpaperController.js   # Request validation & handling
│   ├── routes/
│   │   └── wallpaperRoutes.js       # Route definitions (/api/wallpapers)
│   └── services/
│       ├── wallpaperAggregator.js   # Interleaving, deduplication & sorting
│       └── providers/
│           ├── wallhavenProvider.js # Wallhaven API fetcher
│           ├── unsplashProvider.js  # Unsplash API fetcher
│           └── duckduckgoProvider.js# DuckDuckGo image fetcher
└── testAggregator.js         # Integration and schema verification test
```

---

## License

[MIT](LICENSE) © [Sanyam](https://github.com/sanyam7821)

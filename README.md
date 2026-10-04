# Wallpaper API

A high-performance REST API designed to fetch and aggregate the top wallpaper image URLs from **Wallhaven**, **Unsplash**, and **DuckDuckGo Image Search** for Android APK & mobile client integration.

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
    - [Query Parameters](#query-parameters)
    - [Error Responses](#error-responses)
    - [Response Schema](#response-schema)
    - [Real Example Output for "gojo wallpaper"](#real-example-output-for-gojo-wallpaper)
- [cURL & Postman Examples](#curl--postman-examples)
  - [cURL Testing Commands](#curl-testing-commands)
  - [Postman Setup](#postman-setup)
- [Android APK Integration Guide](#android-apk-integration-guide)
  - [Option 1: Retrofit + Coil (Kotlin)](#option-1-retrofit--coil-kotlin)
  - [Option 2: Ktor Client + Glide (Kotlin)](#option-2-ktor-client--glide-kotlin)
- [Render Deployment Guide](#render-deployment-guide)
  - [Option A: Automatic Blueprint Deployment (`render.yaml`)](#option-a-automatic-blueprint-deployment-renderyaml)
  - [Option B: Manual Web Service Creation](#option-b-manual-web-service-creation)
  - [Environment Variables on Render](#environment-variables-on-render)
- [Project Structure](#project-structure)
- [License](#license)

---

## Overview

**Wallpaper API** is a lightweight, scalable Node.js & Express REST API that fetches top wallpaper image URLs (default top 30) concurrently from multiple providers (**Wallhaven**, **Unsplash**, and **DuckDuckGo Image Search**). It interleaves search results in round-robin order, sorts them by resolution quality, normalizes image URLs for deduplication, and formats them into clean JSON ready for Android app consumption.

---

## Key Features

- **Multi-Provider Aggregation**: Concurrently fetches wallpapers from Wallhaven, Unsplash, and DuckDuckGo Image Search.
- **Round-Robin Interleaving**: Distributes search results across multiple providers evenly.
- **Resolution Quality Prioritization**: Sorts images by total pixel resolution ($width \times height$).
- **URL Deduplication**: Normalizes URLs to eliminate duplicate wallpaper entries.
- **Resilient Fallbacks**: Gracefully continues serving wallpapers even if individual providers encounter rate limits or network issues.
- **Android APK Ready**: Outputs structured JSON schema optimized for Retrofit, Ktor, Coil, and Glide image loading libraries.

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
   Copy `.env.example` to create `.env`:
   ```bash
   cp .env.example .env
   ```
   Or set values directly inside `.env`:
   ```env
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the API server**:
   - **Production Mode**:
     ```bash
     npm start
     ```
   - **Development Mode** (with auto-reload):
     ```bash
     npm run dev
     ```

   The server will start locally at `http://localhost:3000`.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | Port number on which the server listens. |
| `NODE_ENV` | No | `development` | Environment stage (`development` or `production`). |
| `UNSPLASH_ACCESS_KEY` | No | - | Optional Unsplash API key for expanded rate limits. |

---

## API Documentation

### 1. Health Check (`GET /`)

Verifies API server status and availability.

- **Endpoint**: `GET /`
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

Searches and aggregates wallpaper image URLs matching a query term.

- **Endpoint**: `GET /api/wallpapers`
- **Access**: Public

#### Query Parameters

| Parameter | Type | Required | Default | Max | Description |
|---|---|---|---|---|---|
| `query` or `q` | String | **Yes** | - | - | Search query term (e.g. `gojo wallpaper`, `anime wallpaper`). |
| `limit` | Integer | No | `30` | `100` | Maximum number of wallpaper objects to return. |

#### Error Responses

##### Missing Query Parameter (400 Bad Request)
Returned when neither `query` nor `q` query parameter is supplied.

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
| `success` | Boolean | `true` if request succeeded. |
| `query` | String | The normalized search query term processed. |
| `count` | Integer | Number of wallpaper items returned. |
| `data` | Array | List of wallpaper items. |

##### Wallpaper Item Schema (`data[]`)

| Field | Type | Description |
|---|---|---|
| `id` | String | Unique item identifier prefixed with source (e.g. `wallhaven_y8xmok`). |
| `title` | String | Title or descriptive text for the wallpaper. |
| `url` | String | Full direct URL to the high-resolution wallpaper image. |
| `thumbnail` | String | Direct URL to thumbnail preview image. |
| `width` | Integer | Image width in pixels. |
| `height` | Integer | Image height in pixels. |
| `source` | String | Origin provider (`wallhaven`, `unsplash`, or `duckduckgo`). |

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

## cURL & Postman Examples

### cURL Testing Commands

1. **Health Check Endpoint**:
   ```bash
   curl -X GET "http://localhost:3000/"
   ```

2. **Search Wallpapers (`query` parameter)**:
   ```bash
   curl -X GET "http://localhost:3000/api/wallpapers?query=gojo%20wallpaper&limit=30"
   ```

3. **Search Wallpapers (`q` alias parameter)**:
   ```bash
   curl -X GET "http://localhost:3000/api/wallpapers?q=anime%20wallpaper&limit=30"
   ```

4. **Test Query Validation Error (Missing query)**:
   ```bash
   curl -X GET "http://localhost:3000/api/wallpapers"
   ```

### Postman Setup

1. Open Postman and create a new **GET** request.
2. Set Request URL: `http://localhost:3000/api/wallpapers`
3. Under **Params**, add:
   - Key: `query` | Value: `gojo wallpaper`
   - Key: `limit` | Value: `30`
4. Click **Send** to verify the response JSON.

---

## Android APK Integration Guide

### Option 1: Retrofit + Coil (Kotlin)

#### 1. Data Models (`WallpaperResponse.kt`)
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

#### 2. Retrofit Interface (`WallpaperApiService.kt`)
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

#### 3. Compose UI Image Grid (`WallpaperGrid.kt`)
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

### Option 2: Ktor Client + Glide (Kotlin)

```kotlin
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json

val ktorClient = HttpClient(CIO) {
    install(ContentNegotiation) {
        json(Json { ignoreUnknownKeys = true })
    }
}

suspend fun fetchWallpapers(query: String, baseUrl: String): WallpaperResponse {
    return ktorClient.get("$baseUrl/api/wallpapers") {
        parameter("query", query)
        parameter("limit", 30)
    }.body()
}
```

---

## Render Deployment Guide

Step-by-step instructions for deploying Wallpaper API on [Render](https://render.com/).

### Option A: Automatic Blueprint Deployment (`render.yaml`)

This repository includes a pre-configured `render.yaml` blueprint.

1. Push changes to GitHub repository: `sanyam7821/Wallpaper-Api`.
2. Log in to [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** -> **Blueprint**.
4. Select and connect your repository `sanyam7821/Wallpaper-Api`.
5. Render will automatically parse `render.yaml` with the following configuration:
   - **Service Name**: `wallpaper-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Port**: `10000`
   - **NODE_ENV**: `production`
6. Click **Apply** to deploy the web service.

---

### Option B: Manual Web Service Creation

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Select **Build and deploy from a Git repository**.
4. Connect the GitHub repository `sanyam7821/Wallpaper-Api`.
5. Configure the service settings:
   - **Name**: `wallpaper-api`
   - **Region**: Choose nearest region (e.g., Oregon, Frankfurt, Singapore)
   - **Branch**: `main`
   - **Root Directory**: *(Leave blank)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
6. Under **Environment Variables**, add:
   - `PORT`: `10000`
   - `NODE_ENV`: `production`
   - `UNSPLASH_ACCESS_KEY`: *(Optional access key)*
7. Click **Create Web Service**.

---

### Environment Variables on Render

| Key | Value | Notes |
|---|---|---|
| `PORT` | `10000` | Express server port on Render container. |
| `NODE_ENV` | `production` | Enables Express production optimizations. |

---

## Project Structure

```
Wallpaper-Api/
├── .env                      # Local environment configuration
├── .env.example              # Template environment variables
├── Dockerfile                # Docker container definition
├── render.yaml               # Render Blueprint definition
├── package.json              # Dependencies and start scripts
├── README.md                 # Project documentation
├── testAggregator.js         # Integration and schema verification test
└── src/
    ├── app.js                # Express app setup & middleware
    ├── server.js             # HTTP server entry point
    ├── controllers/
    │   └── wallpaperController.js   # Validation & request handler
    ├── routes/
    │   └── wallpaperRoutes.js       # Express routes (/api/wallpapers)
    └── services/
        ├── wallpaperAggregator.js   # Interleaving, deduplication & sorting
        └── providers/
            ├── wallhavenProvider.js # Wallhaven search fetcher
            ├── unsplashProvider.js  # Unsplash API fetcher
            └── duckduckgoProvider.js# DuckDuckGo image scraper
```

---

## License

[MIT](LICENSE) © [Sanyam](https://github.com/sanyam7821)

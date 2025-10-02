# Destiny - High-Performance Trading Platform

A professional-grade, real-time trading platform built with Next.js, TypeScript, and in-memory data architecture. Features ultra-low latency market data access with intelligent caching and real-time updates.

## 🚀 Key Features

### High-Performance In-Memory System
- **Multi-tier caching** with quote cache (5min TTL) and historical cache (1hr TTL)
- **LRU eviction** for intelligent memory management
- **80% memory threshold alerts** with automatic cleanup
- **Sub-second response times** for cached data
- **Real-time subscriptions** with pub-sub pattern

### Market Data Integration
- **Yahoo Finance integration** for real-time quotes
- **Automatic caching** to minimize API calls
- **Data persistence** to MongoDB for recovery
- **Error handling** with retry logic and timeouts

### RESTful API
- `/api/market/quote` - Real-time stock quotes
- `/api/market/history` - Historical price data
- `/api/memory/stats` - Memory usage statistics

## 📖 Documentation

- [Quick Start Guide](./docs/QUICKSTART.md) - Get started in minutes
- [Memory System Documentation](./docs/MEMORY_SYSTEM.md) - Detailed technical documentation

## Getting Started

## Getting Started

### Quick Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/sandeep-jaiswar/destiny.git
   cd destiny
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Add your MongoDB connection string to `.env`:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/destiny?retryWrites=true&w=majority
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Test the API**
   ```bash
   # Get a quote
   curl http://localhost:3000/api/market/quote?symbol=AAPL
   
   # Get historical data
   curl http://localhost:3000/api/market/history?symbol=AAPL&period=1mo
   
   # Check memory stats
   curl http://localhost:3000/api/memory/stats
   ```

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│         API Layer (Next.js Routes)          │
│  /api/market/quote  /api/market/history    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│          MarketDataService                  │
│  ┌──────────────┐  ┌──────────────────┐    │
│  │ Quote Cache  │  │ Historical Cache │    │
│  │  5min TTL    │  │    1hr TTL       │    │
│  │ 500 entries  │  │  100 entries     │    │
│  └──────────────┘  └──────────────────┘    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         SubscriptionEngine                  │
│  EventEmitter-based Pub-Sub                 │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│        Yahoo Finance API                    │
└─────────────────────────────────────────────┘
```

## Performance Metrics

- **Cached Quote Lookup**: < 10ms
- **Fresh Quote Fetch**: < 200ms
- **Cache Hit Rate**: > 85% (typical)
- **Memory Usage**: ~12-50MB (default configuration)
- **Concurrent Connections**: Supports 100+ subscriptions

## Technology Stack

- **Frontend**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: MongoDB Atlas
- **Market Data**: yahoo-finance2
- **Styling**: Tailwind CSS
- **Caching**: In-memory with LRU eviction

## Original Template Info

Click the "Deploy" button to clone this repo, create a new Vercel project, setup the MongoDB integration, and provision a new MongoDB database:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?demo-description=Minimal%20template%20for%20building%20full-stack%20React%20applications%20using%20Next.js%2C%20Vercel%2C%20and%20MongoDB.&demo-image=%2F%2Fimages.ctfassets.net%2Fe5382hct74si%2F4N50YqRe7FHsd0ysfGM8bC%2F1201fe6929b842ec3ee15ee036625471%2Fog.png&demo-title=MongoDB%20%26%20Next.js%20Starter%20Template%20&demo-url=https%3A%2F%2Fnextjs.mongodb.com%2F&products=%255B%257B%2522type%2522%253A%2522integration%2522%252C%2522protocol%2522%253A%2522storage%2522%252C%2522productSlug%2522%253A%2522atlas%2522%252C%2522integrationSlug%2522%253A%2522mongodbatlas%2522%257D%255D&project-name=MongoDB%20%26%20Next.js%20Starter%20Template%20&repository-name=mongo-db-and-next-js-starter-template&repository-url=https%3A%2F%2Fgithub.com%2Fmongodb-developer%2Fnextjs-template-mongodb&root-directories=List%20of%20directory%20paths%20for%20the%20directories%20to%20clone%20into%20projects&skippable-integrations=1)

## Local Setup

### Installation

Install the dependencies:

```bash
npm install
```

### Development

#### Create a .env file in the project root

```bash
cp .env.example .env
```

#### Get your database URL

Obtain the database connection string from the Cluster tab on the [MongoDB Atlas Dashboard](https://account.mongodb.com/account/login/?utm_campaign=devrel&utm_source=third-party-content&utm_medium=cta&utm_content=template-nextjs-mongodb&utm_term=jesse.hall).

#### Add the database URL to the .env file

Update the `.env` file with your database connection string:

```txt
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
```

#### Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about MongoDB, check out the MongoDB documentation:

- [MongoDB Documentation](https://www.mongodb.com/docs/?utm_campaign=devrel&utm_source=third-party-content&utm_medium=cta&utm_content=template-nextjs-mongodb&utm_term=jesse.hall) - learn about MongoDB features and APIs
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/?utm_campaign=devrel&utm_source=third-party-content&utm_medium=cta&utm_content=template-nextjs-mongodb&utm_term=jesse.hall) - documentation for the official Node.js driver

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial

## Deploy on Vercel

Commit and push your code changes to your GitHub repository to automatically trigger a new deployment.

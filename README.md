# Dynamic Portfolio Dashboard

A real-time portfolio dashboard built with Next.js, TypeScript, and Tailwind CSS that displays Indian stock holdings with live market data, sector grouping, and comprehensive financial metrics.

## 🎯 Overview

This dashboard provides investors with real-time insights into their portfolio performance, helping them make informed decisions about buying, selling, holding, or adding to positions. The application fetches live data from financial APIs and displays holdings grouped by sectors with detailed metrics.

## ✨ Features

### Core Functionality
- **Real-Time Updates**: Automatic refresh every 15 seconds via client-side polling
- **Sector Grouping**: Holdings organized by sectors (Financial, Tech, Consumer, Power, Pipe, Others) with sector-level summaries
- **Live Market Data**: 
  - Current Market Price (CMP) from Yahoo Finance
  - P/E Ratio and Latest Earnings from Google Finance
- **Comprehensive Metrics**:
  - Purchase Price, Quantity, Investment
  - Portfolio Weight (percentage allocation)
  - Present Value (CMP × Quantity)
  - Gain/Loss (absolute and percentage)
  - P/E Ratio and Latest Earnings
- **Visual Indicators**: Color-coded gain/loss (green for gains, red for losses)
- **Fallback Data**: Uses data.json values when APIs are unavailable

### Technical Features
- Server-side data enrichment pipeline
- Error handling with graceful fallbacks
- Responsive design with modern UI
- Type-safe implementation with TypeScript
- Optimized performance with caching

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Backend**: Node.js (API Routes)
- **Data Fetching**: Native fetch API
- **Utilities**: clsx for conditional styling

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18.x or higher
- **npm** 9.x or higher (comes with Node.js)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/kiran7893/8byte.git
cd 8byte
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including Next.js, React, TypeScript, and Tailwind CSS.

### 3. Verify Data File

Ensure `data.json` is present in the root directory. This file contains:
- Stock holdings with purchase prices and quantities
- Sector information
- Fallback CMP, P/E Ratio, and Earnings data

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
8byte/
├── app/
│   ├── api/
│   │   └── portfolio/
│   │       └── route.ts          # API endpoint for portfolio data
│   ├── components/
│   │   ├── PortfolioTable.tsx    # Main portfolio table with sector grouping
│   │   └── StatCard.tsx          # KPI cards component
│   ├── lib/
│   │   ├── data-parser.ts       # Parses data.json into structured holdings
│   │   ├── finance.ts            # Yahoo Finance & Google Finance API integration
│   │   ├── format.ts             # Currency, number, and date formatting
│   │   ├── get-portfolio.ts      # Portfolio snapshot generation with sector grouping
│   │   ├── portfolio.ts          # Portfolio data loading
│   │   └── types.ts              # TypeScript type definitions
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main dashboard page (client component)
├── data.json                     # Portfolio data source
├── styles/
│   └── globals.css              # Global styles and Tailwind directives
├── tailwind.config.js           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

## 🔌 Data Sources & API Integration

### Yahoo Finance (CMP)
- **Endpoint**: Unofficial API endpoint for real-time stock prices
- **Format**: `SYMBOL.NS` for NSE, `SYMBOL.BO` for BSE
- **Fallback**: Uses Column8 from data.json if API fails

### Google Finance (P/E & Earnings)
- **Method**: HTML scraping from Google Finance pages
- **Format**: `NSE:SYMBOL` for NSE, `BOM:SYMBOL` for BSE
- **Fallback**: Uses Column13 (P/E) and Column14 (Earnings) from data.json if scraping fails

### Data.json Structure
The `data.json` file contains:
- **Column2**: Stock name
- **Column3**: Purchase price
- **Column4**: Quantity
- **Column7**: NSE/BSE exchange code
- **Column8**: CMP (fallback)
- **Column13**: P/E Ratio (fallback)
- **Column14**: Latest Earnings (fallback)
- Sector rows: Identified by Column2 containing "Sector" or specific sector names

## 🎨 Key Features Explained

### Sector Grouping
Holdings are automatically grouped by sector with:
- Sector summary rows showing total investment, present value, and gain/loss
- Individual stock rows nested under each sector
- Visual separation between sectors

### Real-Time Updates
- Client-side polling every 15 seconds
- Fetches fresh data from `/api/portfolio` endpoint
- Updates UI without full page reload
- Shows loading states during fetch

### Error Handling
- Graceful fallback to data.json values when APIs fail
- Continues displaying last known data if fetch errors occur
- User-friendly error messages with retry functionality

## 🔧 Configuration

### Updating Portfolio Data
Edit `data.json` to add/remove holdings:
1. Maintain the JSON structure
2. Ensure sector rows precede stock entries
3. Include required columns (Column1-Column7 minimum)
4. Add fallback values (Column8, Column13, Column14) for reliability

### Adjusting Polling Interval
In `app/page.tsx`, modify the interval in `useEffect`:
```typescript
const interval = setInterval(() => {
  fetchSnapshot();
}, 15000); // Change 15000 to desired milliseconds
```

### Currency Formatting
Currency formatting is configured in `app/lib/format.ts`:
- Currently set to INR (Indian Rupees)
- Modify `formatCurrency` function to change currency

## 🐛 Troubleshooting

### APIs Not Returning Data
- **Issue**: CMP, P/E, Earnings showing "—"
- **Solution**: The dashboard automatically falls back to data.json values. Check browser console for API errors.

### Data Not Loading
- **Issue**: Dashboard shows loading state indefinitely
- **Solution**: 
  1. Verify `data.json` exists in root directory
  2. Check API route is accessible at `/api/portfolio`
  3. Review server logs for parsing errors

### Build Errors
- **Issue**: `npm run build` fails
- **Solution**: 
  1. Ensure all dependencies are installed: `npm install`
  2. Check TypeScript errors: `npm run lint`
  3. Verify Node.js version is 18+ (check with `node -v`)

## 📝 API Considerations

### Rate Limiting
- Google Finance scraping includes 100ms delay between requests
- Yahoo Finance API may have rate limits
- Consider implementing caching for production use

### Data Accuracy
- Unofficial APIs may have accuracy variations
- Scraped data depends on HTML structure (may break if Google changes markup)
- Always verify critical financial data from official sources

### Disclaimer
Yahoo Finance and Google Finance do not provide official public APIs. This application uses:
- Unofficial endpoints that may change or break
- HTML parsing that depends on page structure
- Fallback data from data.json for reliability

## 🚢 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Vercel will auto-detect Next.js
4. Deploy automatically

### Other Platforms
The application can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 📄 License

This project is a case study implementation for Octa Byte AI Pvt Ltd.

## 👥 Credits

- **Framework**: Next.js by Vercel
- **Data Sources**: Yahoo Finance, Google Finance (unofficial)
- **Design**: Custom implementation with Tailwind CSS

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review browser console for errors
3. Verify data.json structure matches expected format

---

**Note**: This is a case study project. For production use, consider:
- Implementing proper API authentication
- Adding data validation and sanitization
- Setting up monitoring and error tracking
- Using official financial data APIs where available

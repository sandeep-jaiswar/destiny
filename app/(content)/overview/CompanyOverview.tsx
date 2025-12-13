'use client';

import React from 'react';
import type { CompanyData } from './types';

interface CompanyOverviewProps {
  data: CompanyData | null;
}

const CompanyOverview: React.FC<CompanyOverviewProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="p-4">
        <p className="text-gray-400">No company data available</p>
      </div>
    );
  }

  const price = data.price || {};
  const summaryDetail = data.summaryDetail || {};
  const financialData = data.financialData || {};
  const summaryProfile = data.summaryProfile || {};
  const defaultKeyStatistics = data.defaultKeyStatistics || {};
  const earnings = data.earnings || {};

  const currentPrice = price.regularMarketPrice?.fmt || summaryDetail.previousClose?.fmt || 'N/A';
  const priceChange = price.regularMarketChange?.fmt || 'N/A';
  const priceChangePercent = price.regularMarketChangePercent?.fmt || 'N/A';
  const isPositive = (price.regularMarketChange?.raw ?? 0) >= 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="border-b border-gray-700 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{summaryProfile.longName || price.longName || 'N/A'}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
              <span className="px-2 py-1 bg-gray-800 rounded">{price.symbol || 'N/A'}</span>
              {price.quoteSourceName && (
                <span className="px-2 py-1 bg-gray-800 rounded">{price.quoteSourceName}</span>
              )}
            </div>
            {summaryProfile.industry && (
              <p className="mt-2 text-sm text-gray-400">
                {summaryProfile.sector && `${summaryProfile.sector} • `}
                {summaryProfile.industry}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {price.exchangeName && (
              <button className="px-4 py-2 bg-gray-800 rounded text-sm hover:bg-gray-700">
                GP
              </button>
            )}
            <button className="px-4 py-2 bg-gray-800 rounded text-sm hover:bg-gray-700">
              CN
            </button>
            <button className="px-4 py-2 bg-gray-800 rounded text-sm hover:bg-gray-700">
              HDS
            </button>
          </div>
        </div>
      </div>

      {/* Price Section */}
      <div className="border-b border-gray-700 pb-6">
        <div className="flex items-baseline gap-4">
          <span className="text-5xl font-bold">{currentPrice}</span>
          <div className="flex items-center gap-2">
            <span className={`text-xl ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive && '↗'} {priceChange} ({priceChangePercent})
            </span>
          </div>
        </div>
        <div className="flex gap-8 mt-4 text-sm">
          <div>
            <span className="text-gray-400">OPEN</span>
            <p className="font-semibold">{price.regularMarketOpen?.fmt || summaryDetail.open?.fmt || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-400">HIGH</span>
            <p className="font-semibold">{price.regularMarketDayHigh?.fmt || summaryDetail.dayHigh?.fmt || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-400">LOW</span>
            <p className="font-semibold">{price.regularMarketDayLow?.fmt || summaryDetail.dayLow?.fmt || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-400">VOLUME</span>
            <p className="font-semibold">{price.regularMarketVolume?.fmt || summaryDetail.volume?.fmt || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Financial Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Market Cap */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span className="text-orange-500">$</span>
              MARKET CAP
            </span>
            <span className="text-xs bg-gray-800 px-2 py-1 rounded">
              {price.regularMarketChangePercent?.fmt || '+0%'}
            </span>
          </div>
          <p className="text-2xl font-bold">{summaryDetail.marketCap?.fmt || price.marketCap?.fmt || 'N/A'}</p>
          <p className="text-xs text-gray-500 mt-1">USD</p>
        </div>

        {/* P/E Ratio */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span className="text-orange-500">📊</span>
              P/E RATIO
            </span>
            <span className="text-xs bg-gray-800 px-2 py-1 rounded">TTM</span>
          </div>
          <p className="text-2xl font-bold">{summaryDetail.trailingPE?.fmt || defaultKeyStatistics.trailingPE?.fmt || 'N/A'}</p>
          <p className="text-xs text-gray-500 mt-1">vs Industry {defaultKeyStatistics.forwardPE?.fmt || '24.3'}</p>
        </div>

        {/* Revenue */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span className="text-orange-500">📈</span>
              REVENUE
            </span>
            <span className="text-xs bg-gray-800 px-2 py-1 rounded">
              {financialData.revenueGrowth?.fmt || '+0%'}
            </span>
          </div>
          <p className="text-2xl font-bold">{financialData.totalRevenue?.fmt || 'N/A'}</p>
          <p className="text-xs text-gray-500 mt-1">USD • FY 2024</p>
        </div>

        {/* Net Income */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span className="text-orange-500">$</span>
              NET INCOME
            </span>
            <span className="text-xs bg-gray-800 px-2 py-1 rounded">
              {financialData.profitMargins?.fmt || '+0%'}
            </span>
          </div>
          <p className="text-2xl font-bold">{defaultKeyStatistics.netIncomeToCommon?.fmt || 'N/A'}</p>
          <p className="text-xs text-gray-500 mt-1">USD • FY 2024</p>
        </div>

        {/* EPS */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span className="text-orange-500">📊</span>
              EPS
            </span>
            <span className="text-xs bg-gray-800 px-2 py-1 rounded">RATIO</span>
          </div>
          <p className="text-2xl font-bold">{defaultKeyStatistics.trailingEps?.fmt || earnings.financialsChart?.yearly?.[0]?.earnings?.fmt || 'N/A'}</p>
          <p className="text-xs text-gray-500 mt-1">Diluted TTM</p>
        </div>

        {/* Dividend */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span className="text-orange-500">$</span>
              DIVIDEND
            </span>
            <span className="text-xs bg-gray-800 px-2 py-1 rounded">YIELD</span>
          </div>
          <p className="text-2xl font-bold">{summaryDetail.dividendRate?.fmt || defaultKeyStatistics.lastDividendValue?.fmt || 'N/A'}</p>
          <p className="text-xs text-gray-500 mt-1">{summaryDetail.dividendYield?.fmt || defaultKeyStatistics.lastDividendValue?.fmt || '0.52%'} Yield</p>
        </div>

        {/* 52W Range */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span className="text-orange-500">📊</span>
              52W RANGE
            </span>
            <span className="text-xs bg-gray-800 px-2 py-1 rounded">52W</span>
          </div>
          <p className="text-2xl font-bold">{summaryDetail.fiftyTwoWeekLow?.fmt || 'N/A'}-{summaryDetail.fiftyTwoWeekHigh?.fmt || 'N/A'}</p>
          <p className="text-xs text-gray-500 mt-1">USD</p>
        </div>

        {/* Avg Volume */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span className="text-orange-500">📈</span>
              AVG VOLUME
            </span>
            <span className="text-xs bg-gray-800 px-2 py-1 rounded">AVG</span>
          </div>
          <p className="text-2xl font-bold">{summaryDetail.averageVolume?.fmt || defaultKeyStatistics.averageVolume?.fmt || 'N/A'}</p>
          <p className="text-xs text-gray-500 mt-1">30 Day</p>
        </div>
      </div>

      {/* Company Profile and Key Executives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Profile */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-orange-500">🏢</span>
            COMPANY PROFILE
          </h2>
          <div className="space-y-4">
            {summaryProfile.longBusinessSummary && (
              <p className="text-sm text-gray-300 leading-relaxed">
                {summaryProfile.longBusinessSummary}
              </p>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {summaryProfile.ceo && (
                <div>
                  <p className="text-gray-400">CEO</p>
                  <p className="font-semibold">{summaryProfile.ceo}</p>
                </div>
              )}
              {summaryProfile.fullTimeEmployees && (
                <div>
                  <p className="text-gray-400">EMPLOYEES</p>
                  <p className="font-semibold">{summaryProfile.fullTimeEmployees.toLocaleString()}</p>
                </div>
              )}
              {summaryProfile.founded && (
                <div>
                  <p className="text-gray-400">FOUNDED</p>
                  <p className="font-semibold">{summaryProfile.founded}</p>
                </div>
              )}
              {summaryProfile.city && summaryProfile.country && (
                <div>
                  <p className="text-gray-400">HEADQUARTERS</p>
                  <p className="font-semibold">{summaryProfile.city}, {summaryProfile.country}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Executives */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-orange-500">👥</span>
            KEY EXECUTIVES
          </h2>
          <div className="space-y-3">
            {data.assetProfile?.companyOfficers?.slice(0, 4).map((officer, index: number) => (
              <div key={index} className="border-b border-gray-800 pb-3 last:border-0">
                <p className="font-semibold text-orange-500">{officer.name}</p>
                <p className="text-sm text-gray-400">{officer.title}</p>
                {officer.totalPay?.fmt && (
                  <p className="text-xs text-gray-500 mt-1">Pay: {officer.totalPay.fmt}</p>
                )}
              </div>
            )) || (
              <p className="text-sm text-gray-400">No executive information available</p>
            )}
          </div>
        </div>
      </div>

      {/* Financial Ratios */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-orange-500">📊</span>
          FINANCIAL RATIOS
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <p className="text-xs text-gray-400">ROE</p>
            <p className="text-xl font-bold">{financialData.returnOnEquity?.fmt || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">ROA</p>
            <p className="text-xl font-bold">{financialData.returnOnAssets?.fmt || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">PROFIT MARGIN</p>
            <p className="text-xl font-bold">{financialData.profitMargins?.fmt || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">DEBT/EQUITY</p>
            <p className="text-xl font-bold">{financialData.debtToEquity?.fmt || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">CURRENT RATIO</p>
            <p className="text-xl font-bold">{financialData.currentRatio?.fmt || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">BETA</p>
            <p className="text-xl font-bold">{summaryDetail.beta?.fmt || defaultKeyStatistics.beta?.fmt || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyOverview;

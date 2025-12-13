export interface FormattedValue {
  fmt: string;
  raw: number;
}

export interface PriceData {
  symbol?: string;
  longName?: string;
  quoteSourceName?: string;
  regularMarketPrice?: FormattedValue;
  regularMarketChange?: FormattedValue;
  regularMarketChangePercent?: FormattedValue;
  regularMarketOpen?: FormattedValue;
  regularMarketDayHigh?: FormattedValue;
  regularMarketDayLow?: FormattedValue;
  regularMarketVolume?: FormattedValue;
  marketCap?: FormattedValue;
  exchangeName?: string;
}

export interface SummaryDetail {
  previousClose?: FormattedValue;
  open?: FormattedValue;
  dayHigh?: FormattedValue;
  dayLow?: FormattedValue;
  volume?: FormattedValue;
  marketCap?: FormattedValue;
  trailingPE?: FormattedValue;
  dividendRate?: FormattedValue;
  dividendYield?: FormattedValue;
  beta?: FormattedValue;
  fiftyTwoWeekLow?: FormattedValue;
  fiftyTwoWeekHigh?: FormattedValue;
  averageVolume?: FormattedValue;
}

export interface FinancialData {
  totalRevenue?: FormattedValue;
  revenueGrowth?: FormattedValue;
  profitMargins?: FormattedValue;
  returnOnEquity?: FormattedValue;
  returnOnAssets?: FormattedValue;
  debtToEquity?: FormattedValue;
  currentRatio?: FormattedValue;
}

export interface SummaryProfile {
  longName?: string;
  sector?: string;
  industry?: string;
  longBusinessSummary?: string;
  ceo?: string;
  fullTimeEmployees?: number;
  founded?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface DefaultKeyStatistics {
  trailingPE?: FormattedValue;
  forwardPE?: FormattedValue;
  trailingEps?: FormattedValue;
  netIncomeToCommon?: FormattedValue;
  lastDividendValue?: FormattedValue;
  beta?: FormattedValue;
  averageVolume?: FormattedValue;
}

export interface CompanyOfficer {
  name: string;
  title: string;
  totalPay?: FormattedValue;
}

export interface AssetProfile {
  companyOfficers?: CompanyOfficer[];
}

export interface EarningsData {
  financialsChart?: {
    yearly?: Array<{
      date: number;
      earnings?: FormattedValue;
      revenue?: FormattedValue;
    }>;
  };
}

export interface CompanyData {
  price?: PriceData;
  summaryDetail?: SummaryDetail;
  financialData?: FinancialData;
  summaryProfile?: SummaryProfile;
  defaultKeyStatistics?: DefaultKeyStatistics;
  earnings?: EarningsData;
  assetProfile?: AssetProfile;
  error?: string;
}

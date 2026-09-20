"""Explicit PyArrow schemas for all datasets — fixes the string-typing bug."""

import pyarrow as pa


# Equities
BHAVCOPY_SCHEMA = pa.schema([
    ("symbol", pa.string()),
    ("name", pa.string()),
    ("series", pa.string()),
    ("date", pa.date32()),
    ("open_price", pa.float64()),
    ("high_price", pa.float64()),
    ("low_price", pa.float64()),
    ("close_price", pa.float64()),
    ("last_price", pa.float64()),
    ("total_traded_quantity", pa.int64()),
    ("turnover", pa.float64()),
    ("no_of_trades", pa.int32()),
    ("year", pa.int16()),
    ("month", pa.int8()),
])

ADJUSTMENT_FACTORS_SCHEMA = pa.schema([
    ("symbol", pa.string()),
    ("date", pa.date32()),
    ("split_factor", pa.float64()),
    ("bonus_factor", pa.float64()),
    ("cumulative_factor", pa.float64()),
    ("description", pa.string()),
])

# Indices
INDEX_HISTORY_SCHEMA = pa.schema([
    ("index_name", pa.string()),
    ("date", pa.date32()),
    ("open_price", pa.float64()),
    ("high_price", pa.float64()),
    ("low_price", pa.float64()),
    ("close_price", pa.float64()),
    ("volume", pa.int64()),
    ("turnover", pa.float64()),
    ("year", pa.int16()),
    ("month", pa.int8()),
])

# Derivatives
FO_BHAVCOPY_SCHEMA = pa.schema([
    ("instrument", pa.string()),
    ("expiry", pa.date32()),
    ("strike", pa.float64()),
    ("option_type", pa.string()),
    ("date", pa.date32()),
    ("open_price", pa.float64()),
    ("high_price", pa.float64()),
    ("low_price", pa.float64()),
    ("close_price", pa.float64()),
    ("settlement_price", pa.float64()),
    ("open_interest", pa.int64()),
    ("volume", pa.int64()),
    ("turnover", pa.float64()),
    ("year", pa.int16()),
    ("month", pa.int8()),
])

# Commodities
MCX_BHAVCOPY_SCHEMA = pa.schema([
    ("symbol", pa.string()),
    ("contract_month", pa.string()),
    ("date", pa.date32()),
    ("open_price", pa.float64()),
    ("high_price", pa.float64()),
    ("low_price", pa.float64()),
    ("close_price", pa.float64()),
    ("volume", pa.int64()),
    ("turnover", pa.float64()),
    ("year", pa.int16()),
    ("month", pa.int8()),
])

NSE_COMMODITIES_SCHEMA = pa.schema([
    ("symbol", pa.string()),
    ("date", pa.date32()),
    ("open_price", pa.float64()),
    ("high_price", pa.float64()),
    ("low_price", pa.float64()),
    ("close_price", pa.float64()),
    ("volume", pa.int64()),
    ("turnover", pa.float64()),
    ("year", pa.int16()),
    ("month", pa.int8()),
])

# Currency
CURRENCY_BHAVCOPY_SCHEMA = pa.schema([
    ("symbol", pa.string()),
    ("date", pa.date32()),
    ("open_price", pa.float64()),
    ("high_price", pa.float64()),
    ("low_price", pa.float64()),
    ("close_price", pa.float64()),
    ("volume", pa.int64()),
    ("turnover", pa.float64()),
    ("year", pa.int16()),
    ("month", pa.int8()),
])

# Corporate
FINANCIAL_RESULTS_SCHEMA = pa.schema([
    ("symbol", pa.string()),
    ("company_name", pa.string()),
    ("period", pa.string()),
    ("revenue", pa.float64()),
    ("net_profit", pa.float64()),
    ("eps", pa.float64()),
    ("announcement_date", pa.date32()),
    ("results_date", pa.date32()),
    ("year", pa.int16()),
    ("quarter", pa.int8()),
])

CORPORATE_ACTIONS_SCHEMA = pa.schema([
    ("symbol", pa.string()),
    ("action_type", pa.string()),
    ("ex_date", pa.date32()),
    ("record_date", pa.date32()),
    ("payment_date", pa.date32()),
    ("ratio", pa.float64()),
    ("description", pa.string()),
    ("symbol_partition", pa.string()),  # for partitioning
])

# Institutional
FII_DII_SCHEMA = pa.schema([
    ("date", pa.date32()),
    ("category", pa.string()),
    ("buy_value", pa.float64()),
    ("sell_value", pa.float64()),
    ("net_value", pa.float64()),
    ("buy_quantity", pa.int64()),
    ("sell_quantity", pa.int64()),
    ("net_quantity", pa.int64()),
    ("year", pa.int16()),
    ("month", pa.int8()),
])

# Surveillance
SURVEILLANCE_SCHEMA = pa.schema([
    ("symbol", pa.string()),
    ("date", pa.date32()),
    ("status", pa.string()),
    ("reason", pa.string()),
    ("year", pa.int16()),
    ("month", pa.int8()),
])

# Meta
SYMBOLS_SCHEMA = pa.schema([
    ("symbol", pa.string()),
    ("name", pa.string()),
    ("series", pa.string()),
    ("isin", pa.string()),
])


# Map dataset names to schemas
SCHEMAS = {
    # Equities
    ("equities", "bhavcopy"): BHAVCOPY_SCHEMA,
    ("equities", "adjustment_factors"): ADJUSTMENT_FACTORS_SCHEMA,
    # Indices
    ("indices", "history"): INDEX_HISTORY_SCHEMA,
    # Derivatives
    ("derivatives", "fo_bhavcopy"): FO_BHAVCOPY_SCHEMA,
    # Commodities
    ("commodities", "mcx"): MCX_BHAVCOPY_SCHEMA,
    ("commodities", "nse_commodities"): NSE_COMMODITIES_SCHEMA,
    # Currency
    ("currency", "bhavcopy"): CURRENCY_BHAVCOPY_SCHEMA,
    # Corporate
    ("corporate", "financial_results"): FINANCIAL_RESULTS_SCHEMA,
    ("corporate", "actions"): CORPORATE_ACTIONS_SCHEMA,
    # Institutional
    ("institutional", "fii_dii"): FII_DII_SCHEMA,
    # Surveillance
    ("surveillance", "asm"): SURVEILLANCE_SCHEMA,
    ("surveillance", "gsm"): SURVEILLANCE_SCHEMA,
    ("surveillance", "short_ban"): SURVEILLANCE_SCHEMA,
    # Meta
    ("meta", "symbols"): SYMBOLS_SCHEMA,
}


def get_schema(category: str, dataset: str) -> pa.Schema:
    """Get the PyArrow schema for a dataset."""
    return SCHEMAS.get((category, dataset))

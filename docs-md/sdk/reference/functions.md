---
title: Formula Functions
---

# Formula Functions

For the most up to date formula functions reference, please check the [Sisense Fusion documentation](https://docs.sisense.com/main/SisenseLinux/dashboard-functions-reference.htm)

For convenience, a reference of functions you may use within [`measureFactory.customFormula()`](../modules/sdk-data/factories/namespace.measureFactory/functions/function.customFormula.md) of Compose SDK is also included below.

## Overview

The following functions are available:

- [Universal Functions](#universal-functions)
  - [Aggregative Functions](#aggregative-functions)
    - [Average (`AVG`)](#average-avg)
    - [Count Unique (`COUNT`)](#count-unique-count)
    - [Count with Duplicates (`DUPCOUNT`)](#count-with-duplicates-dupcount)
    - [Largest (`LARGEST`)](#largest-largest)
    - [Maximum (`MAX`)](#maximum-max)
    - [Median (`MEDIAN`)](#median-median)
    - [Minimum (`MIN`)](#minimum-min)
    - [Mode (`MODE`)](#mode-mode)
    - [Sum (`SUM`)](#sum-sum)
  - [Statistical Functions](#statistical-functions)
    - [Contribution (`CONTRIBUTION`)](#contribution-contribution)
    - [Percentile (`PERCENTILE`)](#percentile-percentile)
    - [Quartile (`QUARTILE`)](#quartile-quartile)
    - [Rank (`RANK`)](#rank-rank)
    - [Standard Deviation - Population (`STDEVP`)](#standard-deviation---population-stdevp)
    - [Standard Deviation - Sample (`STDEV`)](#standard-deviation---sample-stdev)
    - [Variance - Population (`VARP`)](#variance---population-varp)
    - [Variance - Sample (`VAR`)](#variance---sample-var)
  - [Mathematical Functions](#mathematical-functions)
    - [Absolute Value (`ABS`)](#absolute-value-abs)
    - [Arccosine (`ACOS`)](#arccosine-acos)
    - [Arcsine (`ASIN`)](#arcsine-asin)
    - [Arctangent (`ATAN`)](#arctangent-atan)
    - [Ceiling (`CEILING`)](#ceiling-ceiling)
    - [Cosine (`COS`)](#cosine-cos)
    - [Cotangent (`COT`)](#cotangent-cot)
    - [Exponential (`EXP`)](#exponential-exp)
    - [Floor (`FLOOR`)](#floor-floor)
    - [Natural Log (`LN`)](#natural-log-ln)
    - [Log Base-10 (`LOG10`)](#log-base-10-log10)
    - [Modulo (`MOD`)](#modulo-mod)
    - [Power (`POWER`)](#power-power)
    - [Quotient (`QUOTIENT`)](#quotient-quotient)
    - [Round (`ROUND`)](#round-round)
    - [Sine (`SIN`)](#sine-sin)
    - [Square Root (`SQRT`)](#square-root-sqrt)
    - [Tangent (`TAN`)](#tangent-tan)
  - [Time-related Functions](#time-related-functions)
    - [Second Difference (`SDIFF`)](#second-difference-sdiff)
    - [Minute Difference (`MNDIFF`)](#minute-difference-mndiff)
    - [Hour Difference (`HDIFF`)](#hour-difference-hdiff)
    - [Day Difference (`DDIFF`)](#day-difference-ddiff)
    - [Month Difference (`MDIFF`)](#month-difference-mdiff)
    - [Quarter Difference (`QDIFF`)](#quarter-difference-qdiff)
    - [Year Difference (`YDIFF`)](#year-difference-ydiff)
    - [Past Week Difference (`DIFFPASTWEEK`)](#past-week-difference-diffpastweek)
    - [Past Month Difference (`DIFFPASTMONTH`)](#past-month-difference-diffpastmonth)
    - [Past Quarter Difference (`DIFFPASTQUARTER`)](#past-quarter-difference-diffpastquarter)
    - [Past Year Difference (`DIFFPASTYEAR`)](#past-year-difference-diffpastyear)
    - [Past Period Difference (`DIFFPASTPERIOD`)](#past-period-difference-diffpastperiod)
    - [Growth (`GROWTH`)](#growth-growth)
    - [Growth Rate (`GROWTHRATE`)](#growth-rate-growthrate)
    - [Growth Past Week (`GROWTHPASTWEEK`)](#growth-past-week-growthpastweek)
    - [Growth Past Month (`GROWTHPASTMONTH`)](#growth-past-month-growthpastmonth)
    - [Growth Past Quarter (`GROWTHPASTQUARTER`)](#growth-past-quarter-growthpastquarter)
    - [Growth Past Year (`GROWTHPASTYEAR`)](#growth-past-year-growthpastyear)
    - [Past Day (`PASTDAY`)](#past-day-pastday)
    - [Past Week (`PASTWEEK`)](#past-week-pastweek)
    - [Past Month (`PASTMONTH`)](#past-month-pastmonth)
    - [Past Quarter (`PASTQUARTER`)](#past-quarter-pastquarter)
    - [Past Year (`PASTYEAR`)](#past-year-pastyear)
    - [Week to Date Average (`WTDAVG`)](#week-to-date-average-wtdavg)
    - [Week to Date Sum (`WTDSUM`)](#week-to-date-sum-wtdsum)
    - [Month to Date Average (`MTDAVG`)](#month-to-date-average-mtdavg)
    - [Month to Date Sum (`MTDSUM`)](#month-to-date-sum-mtdsum)
    - [Quarter to Date Average (`QTDAVG`)](#quarter-to-date-average-qtdavg)
    - [Quarter to Date Sum (`QTDSUM`)](#quarter-to-date-sum-qtdsum)
    - [Year to Date Average (`YTDAVG`)](#year-to-date-average-ytdavg)
    - [Year to Date Sum (`YTDSUM`)](#year-to-date-sum-ytdsum)
  - [Measured Value Functions](#measured-value-functions)
    - [All (`ALL`)](#all-all)
    - [Previous (`PREV`)](#previous-prev)
    - [Next (`NEXT`)](#next-next)
    - [Now (`NOW`)](#now-now)
  - [Other Functions](#other-functions)
    - [Case (`CASE`)](#case-case)
    - [If (`IF`)](#if-if)
    - [Is Null (`ISNULL`)](#is-null-isnull)
    - [Now (`NOW`)](#now-now-1)
    - [Running Average (`RAVG`)](#running-average-ravg)
    - [Running Sum (`RSUM`)](#running-sum-rsum)
- [Elasticube-only Functions](#fusion-elasticube-only-functions)
  - [Aggregative Functions](#aggregative-functions-1)
    - [Correlation (`CORREL`)](#correlation-correl)
    - [Covariance - Population (`COVARP`)](#covariance---population-covarp)
    - [Covariance - Sample (`COV`)](#covariance---sample-covar)
    - [Skewness - Population (`SKEWP`)](#skewness---population-skewp)
    - [Skewness - Sample (`SKEW`)](#skewness---sample-skew)
    - [Slope (`SLOPE`)](#slope-slope)
  - [Statistical Functions](#statistical-functions-1)
    - [Exponential Distribution (`EXPONDIST`)](#exponential-distribution-expondist)
    - [Intercept (`INTERCEPT`)](#intercept-intercept)
    - [Normal Distribution (`NORMDIST`)](#normal-distribution-normdist)
    - [Poisson Distribution (`POISSONDIST`)](#poisson-distribution-poissondist)
    - [T Distribution (`TDIST`)](#t-distribution-tdist)
  - [Mathematical Functions](#mathematical-functions-1)
    - [Hyperbolic Cosine (`COSH`)](#hyperbolic-cosine-cosh)
    - [Hyperbolic Sine (`SINH`)](#hyperbolic-sine-sinh)
    - [Hyperbolic Tangent (`TAN`)](#hyperbolic-tangent-tanh)
  - [Other Functions](#other-functions-1)
    - [Ordering (`ORDERING`)](#ordering-ordering)
    - [R Double (`RDOUBLE`)](#r-double-rdouble)
    - [R Integer (`RINT`)](#r-integer-rint)

### Everything aggregative

The Analytical Engine requires that every measure defined in a formula be aggregative. For example, instead of `DDiff([Discharge Time], [Admission Time])`, use `AVG(DDiff([Discharge Time], [Admission Time]))`.

### Multi-pass

All aggregative functions can be run by themselves or as part of a multi-pass aggregation. The multi-pass version of an aggregative function in essence runs an aggregation on a function (instead of a value) and groups the results.

Multi-pass aggregations take the following form, where `INNER` is a function, `<group_by_field>` is the field to group the inner function's results by, and `OUTER` is an aggregation over the inner function's grouped results:

```
OUTER(<group_by_field>, INNER(<field>))

```

This concept is a bit easier to understand after seeing it in practice, so let's take a look how you might calculate something like the average total revenue per product.

Consider the following multi-pass call:

```
AVG([Product], SUM(Revenue));

```

This call calculates the average total revenue per product. It does so by calculating the total revenue per product and then taking the average of all those totals.

### Date resolution

Datetime fields within queries can be resolved at a number of levels. For the purpose of the functions in this reference, you can resolve the dates in your queries to years, quarters, months, weeks, or days.

The active date resolution of a query is determined by the minimum date level of the date dimension used for presentation and filtering.

For example, suppose you have a data model containing data for 2 complete years.

If you query that model for total cost and you resolve a date in the query to years, you receive the total cost for each of the 2 years.

| Year in Date | Total Cost    |
| ------------ | ------------- |
| 2022         | 33,705,906.25 |
| 2023         | 37,722,696.58 |

However, if you query that same data model for total cost and you resolve a date to quarters, you receive the total cost for each of the 8 quarters in the 2 years.

| Quarter in Date |   Total Cost |
| --------------- | -----------: |
| 2022 Q1         | 6,970,893.27 |
| 2022 Q2         | 7,549,119.55 |
| 2022 Q3         | 8,136,195.73 |
| 2022 Q4         | 11,049,697.6 |
| 2023 Q1         |  8,594,218.7 |
| 2023 Q2         | 9,408,611.73 |
| 2023 Q3         | 10,169,728.6 |
| 2023 Q4         | 9,550,137.52 |

The resolution of datetime fields also affects how time-related functions are calculated.

As an example, let's use the same data model with 2 complete years of data to examine how the date resolution of a query affects the `DIFFPASTYEAR()` function, which calculates the difference between the current year's data and the previous year's data.

If you query that model for the `DIFFPASTYEAR(SUM([COST]))` and you resolve a date in the query to years, you receive the cost of the previous year for each of the 2 years and the difference in cost from the first year to the second year.

| Year in Date | Total Cost    | Difference in Cost |
| ------------ | ------------- | ------------------ |
| 2022         | 33,705,906.25 |                    |
| 2023         | 37,722,696.58 | 4,016,790.33       |

However, if you query that same data model for difference in total cost and you resolve that date to quarters, you receive the total cost for each of the 8 quarters in the 2 years and the difference in cost between quarters. Notice how the difference in cost is calculated based on the same quarter in the previous year. So the difference in total cost for 2023 Q3 is the difference when compared to the total cost of 2022 Q3.

| Year in Date | Total Cost    | Difference in Cost |
| ------------ | ------------- | ------------------ |
| 2022 Q1      | 6,970,893.27  |                    |
| 2022 Q2      | 7,549,119.55  |                    |
| 2022 Q3      | 8,136,195.73  |                    |
| 2022 Q4      | 11,049,697.69 |                    |
| 2023 Q1      | 8,594,218.7   | 1,623,325.44       |
| 2023 Q2      | 9,408,611.73  | 1,859,492.17       |
| 2023 Q3      | 10,169,728.63 | 2,033,532.90       |
| 2023 Q4      | 9,550,137.52  | -1,499,560.17      |

## Universal Functions

These functions may be used for both Live and ElastiCube models within the Sisense Fusion platform.

### Aggregative Functions

Functions that create aggregations.

---

#### Average (`AVG`)

Gets the average of given values.

##### Syntax (`AVG`)

```
AVG(<numeric_field>)

```

| Argument          | Description       |
| ----------------- | ----------------- |
| `<numeric_field>` | Any numeric field |

##### Example (`AVG`)

Calculate the average revenue.

```
AVG([Revenue]);

```

---

#### Count Unique (`COUNT`)

Counts the number of unique values.

##### Syntax (`COUNT`)

```
COUNT(<numeric_field>)

```

##### Example (`COUNT`)

Count the number of different category IDs.

```
COUNT([Category ID])

```

---

#### Count with Duplicates (`DUPCOUNT`)

Counts the number of values, including duplicates.

##### Syntax (`DUPCOUNT`)

```
DUPCOUNT(<numeric_field>)

```

##### Example (`DUPCOUNT`)

Count the number of category IDs.

```
DUPCOUNT([Category ID])

```

---

#### Largest (`LARGEST`)

Gets the nth largest of the given values.

##### Syntax (`LARGEST`)

```
LARGEST(<numeric_field>, <n>)

```

- `numeric_field`: Field to find the largest from.
- `n`: Which value from the largest value to get. For example, when `n` is `3`, the third largest value is retrieved.

##### Example (`LARGEST`)

Gets the third largest sales value.

```
LARGEST([Sales], 3);

```

---

#### Maximum (`MAX`)

Gets the largest of the given values.

##### Syntax (`MAX`)

```
MAX(<numeric_field>)

```

##### Example

Get the maximum revenue value.

```
MAX([Revenue]);

```

---

#### Median (`MEDIAN`)

Gets the median value of the given values.

##### Syntax (`MEDIAN`)

```
MEDIAN(<numeric_field>)

```

##### Example (`MEDIAN`)

Get the median revenue value.

```
MEDIAN([Revenue]);

```

---

#### Minimum (`MIN`)

Gets the smallest of the given values.

##### Syntax (`MIN`)

```
MIN(<numeric_field>)

```

##### Example (`MIN`)

Get the minimum revenue value.

```
MIN([Revenue]);

```

---

#### Mode (`MODE`)

Gets the mode of the given values. The mode is the most frequently occurring value. If there is more than one mode value, one of them is returned at random.

##### Syntax (`MODE`)

```
MODE(<numeric_field>)

```

##### Example (`MODE`)

Get the mode revenue value.

```
MODE([Revenue]);

```

---

#### Sum (`SUM`)

Calculates the total of the given values.

##### Syntax (`SUM`)

```
SUM(<numeric_field>)

```

##### Example (`SUM`)

Calculates the total cost across all items.

```
SUM([Cost]);

```

---

### Statistical Functions

Functions that calculate statistical data.

---

#### Contribution (`CONTRIBUTION`)

Calculates the contribution, in percentage, of a value towards the total.

##### Syntax (`CONTRIBUTION`)

```
CONTRIBUTION(<numeric_field>)

```

##### Example (`CONTRIBUTION`)

Calculate the percentage of total sales per group out of total sales for all groups together.

```
CONTRIBUTION([Total Sales])

```

---

#### Percentile (`PERCENTILE`)

Gets the nth percentile value of the given values.

##### Syntax (`PERCENTILE`)

```
PERCENTILE(<numeric_field>, <n>)

```

- `numeric_field`: Field to find the percentile from.
- `n`: A number between `0` and `1` (inclusive) to indicate the percentile.

##### Example (`PERCENTILE`)

Gets the 90th percentile of total sales.

```
PERCENTILE([Total Sales], 0.9)

```

---

#### Quartile (`QUARTILE`)

Gets the nth quartile value of the given values. Can return minimum value, first quartile, second quartile, third quartile, or max value.

##### Syntax (`QUARTILE`)

```
QUARTILE(<numeric_field>, <n>)

```

- `numeric_field`: Field to find the quartile from.
- `n`: A number between `0` and `4` (inclusive) to indicate the quartile.
  - `0`: Minimum value
  - `1`: First quartile (25th percentile)
  - `2`: Third quartile (50th percentile)
  - `3`: First quartile (75th percentile)
  - `4`: Maximum value

##### Example (`QUARTILE`)

Gets the first quartile of a given item.

```
QUARTILE([Item], 1);

```

---

#### Rank (`RANK`)

Gets the rank of a value from the given values.

##### Syntax (`RANK`)

```
RANK(<numeric_field>, [sort_order], [rank_type], [<group-by field 1>,... , <group-by field n>])

```

- `numeric_field`: Field to rank by.
- `sort_order`: Optional sort order. Either `DESC` or `ASC`. Defaults to ascending order.
- `rank_type`: Optional ranking type. Defaults to `1224` ranking.
  - `1224`: Standard competition, meaning items that rank equally receive the same ranking number, and then a gap is left after the equally ranked items in the ranking numbers.
  - `1334`: Modified competition ranking, meaning items that rank equally receive the same ranking number, and a gap is left before the equally ranked items in the ranking numbers. Only supported for Fusion Datamodels.
  - `1223`: Dense ranking, meaning items that rank equally receive the same ranking number, and the next items receive the immediately following ranking number.
  - `1234`: Ordinal ranking, meaning all items receive distinct ordinal numbers, including items that rank equally. The assignment of distinct ordinal numbers for equal-ranking items is arbitrary.
- `[<group-by field 1>,... , <group-by field n>]`: Optional fields to group by.

##### Example (`RANK`)

Gets the rank of the total annual cost per product, sorted in ascending order.

```
RANK([Total Cost], "ASC", "1224", [Product], [Years])

```

---

#### Standard Deviation - Population (`STDEVP`)

Gets the standard deviation of the given values (population). Standard deviation is the square root of the average squared deviation from the mean. The standard deviation of a population gives researchers the amount of dispersion of data for an entire population of survey respondents.

##### Syntax (`STDEVP`)

```
STDEVP(<numeric_field>)

```

##### Example (`STDEVP`)

Get the standard deviation of the values in a given population.

```
STDEVP([Score])

```

---

#### Standard Deviation - Sample (`STDEV`)

Gets the standard deviation of the given values (sample). Standard deviation is the square root of the average squared deviation from the mean. A standard deviation of a sample estimates the amount of dispersion in a given data set, based on a random sample.

##### Syntax (`STDEV`)

```
STDEV(<numeric_field>)

```

##### Example (`STDEV`)

Get the standard deviation of the given values in a given sample.

```
STDEV([Score])

```

---

#### Variance - Population (`VARP`)

Gets the variance of the given values (population). Variance (population) is the average squared deviation from the mean, based on an entire population of survey respondents.

##### Syntax (`VARP`)

```
VARP(<numeric_field>)

```

##### Example (`VARP`)

Get the variance of grades in a student population.

```
VARP([Grade]);

```

---

#### Variance - Sample (`VAR`)

Gets the variance of the given values (sample). Variance (sample) is the average squared deviation from the mean, based on a random sample of the population.

##### Syntax (`VAR`)

```
VAR(<numeric_field>)

```

##### Example (`VAR`)

Gets the variance of grades in a random sample.

```
VAR([Grade]);

```

---

### Mathematical Functions

Functions that perform mathematical operations.

---

#### Absolute Value (`ABS`)

Gets the absolute value of a given value.

##### Syntax (`ABS`)

```
ABS(<numeric_field>)

```

##### Example (`ABS`)

Get the absolute cost value.

```
ABS([Cost]);

```

---

#### Arccosine (`ACOS`)

Gets the angle, in radians, whose cosine is a given numeric expression. Also referred to as arccosine.

##### Syntax (`ACOS`)

```
ACOS(<numeric_field>)

```

#### Examples (`ACOS`)

Get the angle, in radians, whose cosine is a given total revenue.

```
ACOS([Total Revenue])

```

---

#### Arcsine (`ASIN`)

Gets the angle, in radians, whose sine is a given numeric expression. Also referred to as arcsine.

##### Syntax (`ASIN`)

```
ASIN(<numeric_field>)

```

##### Example (`ASIN`)

Get the angle, in radians, whose sine is a given total revenue.

```
ASIN([Total Revenue])

```

---

#### Arctangent (`ATAN`)

Gets the angle in radians whose tangent is a given numeric expression. Also referred to as arctangent.

##### Syntax (`ATAN`)

```
ATAN(<numeric_field>)

```

##### Example (`ATAN`)

Get the angle in radians whose tangent is a given total revenue.

```
ATAN([Total Revenue])

```

---

#### Ceiling (`CEILING`)

Calculates a number rounded up to the nearest multiple of significance.

##### Syntax (`CEILING`)

```
CEILING(<numeric_field>)

```

##### Example (`CEILING`)

Calculate the rounded up total cost. For example, when the cost is 83.2 it is rounded up to 84.

```
CEILING([Total Cost])

```

---

#### Cosine (`COS`)

Calculates the trigonometric cosine of a given angle (in radians).

##### Syntax (`COS`)

```
COS(<numeric_field>)

```

##### Example (`COS`)

Calculate the trigonometric cosine of the average angle.

```
COS([Average Angle])

```

---

#### Cotangent (`COT`)

Calculates the trigonometric cotangent of a given angle (in radians).

##### Syntax (`COT`)

```
COT(<numeric_field>)

```

##### Example (`COT`)

Calculate the trigonometric cotangent of the average angle.

```
COT([Average Angle])

```

---

#### Exponential (`EXP`)

Calculates the exponential value of a given value.

##### Syntax (`EXP`)

```
EXP(<numeric_field>)

```

##### Example (`EXP`)

Calculate the exponential value of sales.

```
EXP([Sales]);

```

---

#### Floor (`FLOOR`)

Calculates a number rounded down to the nearest multiple of 1.

##### Syntax (`FLOOR`)

```
FLOOR(<numeric_field>)

```

##### Example (`FLOOR`)

Calculate the rounded down total cost. For example, when the cost is 83.2 it is rounded down to 83.

```
CEILING([Total Cost])

```

---

#### Natural Log (`LN`)

Calculates the base-e logarithm of a given value.

##### Syntax (`LN`)

```
LN(<numeric_field>)

```

##### Example (`LN`)

Returns the base e-logarithm of the interest rate.

```
LN([Interest Rate])

```

---

#### Log Base-10 (`LOG10`)

Calculates the base-10 logarithm of a given value.

##### Syntax (`LOG10`)

```
LOG10(<numeric_field>)

```

##### Example (`LOG10`)

Calculates the base-10 logarithm of the interest rate.

```
LOG10([Interest Rate])

```

---

#### Modulo (`MOD`)

Calculates the remainder (modulo) after a given value is divided by a number.

##### Syntax (`MOD`)

```
MOD(<numeric_field>)

```

##### Example (`MOD`)

Calculate the remainder of the cost divided by 10. For example, if the cost is 25, the remainder is 5.

```
MOD([Cost], 10);

```

---

#### Power (`POWER`)

Calculates a given value raised to a specified power.

##### Syntax (`POWER`)

```
POWER(<numeric_field>)

```

##### Example (`POWER`)

Calculate the value of the revenue squared.

```
POWER([Revenue], 2);

```

---

#### Quotient (`QUOTIENT`)

Calculates the integer portion of a division.

##### Syntax (`QUOTIENT`)

```
QUOTIENT(<numeric_field>)

```

##### Example (`QUOTIENT`)

Calculate the cost divided by 10. For example, if the cost is 25, the quotient is 2.

```
QUOTIENT([Cost], 10);

```

---

#### Round (`ROUND`)

Calculates a given value rounded to a specified number of digits.

##### Syntax (`ROUND`)

```
ROUND(<numeric_field>, <decimal_places>)

```

- `numeric_field`: Field to round.
- `decimal_places`: Number of decimal places to round to.

##### Example (`ROUND`)

Calculate the revenue rounded to two decimal places.

```
ROUND([Revenue], 2);

```

---

#### Sine (`SIN`)

Calculates the trigonometric sine of a given angle (in radians).

##### Syntax (`SIN`)

```
SIN(<numeric_field>)

```

##### Example (`SIN`)

Calculate the trigonometric sine of the average angle.

```
SIN([Average Angle])

```

---

#### Square Root (`SQRT`)

Calculates the square root of a given value. The given values must be positive numbers.

##### Syntax (`SQRT`)

```
SQRT(<numeric_field>)

```

##### Example (`SQRT`)

Calculate the square root of the cost.

```
SQRT([Cost]);

```

---

#### Tangent (`TAN`)

Calculates the trigonometric tangent of a given angle (in radians).

##### Syntax (`TAN`)

```
TAN(<numeric_field>)

```

##### Example (`TAN`)

Calculate the trigonometric tangent of the average angle.

```
TAN([Average Angle])

```

---

### Time-related Functions

Functions that work with dates and times.

---

#### Second Difference (`SDIFF`)

Calculates the difference between an end time and start time in seconds.

##### Syntax (`SDIFF`)

```
SDIFF(<end_datetime_field>, <start_datetime_field>)

```

- `end_datetime_field`: Ending time to take the difference from
- `start_datetime_field`: Starting time to take the difference from

##### Example (`SDIFF`)

Calculate the difference in seconds from the time of entering to the time of leaving.

```
SDIFF([Leave Time], [Enter Time])

```

---

#### Minute Difference (`MNDIFF`)

Calculates the difference between an end time and start time in whole minutes.

##### Syntax (`MNDIFF`)

```
MNDIFF(<end_datetime_field>, <start_datetime_field>)

```

- `end_datetime_field`: Ending time to take the difference from
- `start_datetime_field`: Starting time to take the difference from

##### Example (`MNDIFF`)

Calculate the difference in minutes from the time of entering to the time of leaving.

```
MNDIFF([Leave Time], [Enter Time])

```

---

#### Hour Difference (`HDIFF`)

Calculates the difference between an end time and start time in whole hours.

##### Syntax (`HDIFF`)

```
HDIFF(<end_datetime_field>, <start_datetime_field>)

```

- `end_datetime_field`: Ending time to take the difference from
- `start_datetime_field`: Starting time to take the difference from

##### Example (`HDIFF`)

Calculate the difference in hours from the time of entering to the time of leaving.

```
HDIFF([Leave Time], [Enter Time])

```

---

#### Day Difference (`DDIFF`)

Calculates the difference between an end time and start time in whole days.

##### Syntax (`DDIFF`)

```
DDIFF(<end_datetime_field>, <start_datetime_field>)

```

- `end_datetime_field`: Ending time to take the difference from
- `start_datetime_field`: Starting time to take the difference from

##### Example (`DDIFF`)

Calculate the difference in days from the time of entering to the time of leaving.

```
DDIFF([Leave Time], [Enter Time])

```

---

#### Month Difference (`MDIFF`)

Calculates the difference between an end time and start time in whole months.

##### Syntax (`MDIFF`)

```
MDIFF(<end_datetime_field>, <start_datetime_field>)

```

- `end_datetime_filed`: Ending time to take the difference from
- `start_datetime_field`: Starting time to take the difference from

##### Example (`MDIFF`)

Calculate the difference in months from the time of entering to the time of leaving.

```
MDIFF([Leave Time], [Enter Time])

```

---

#### Quarter Difference (`QDIFF`)

Calculates the difference between an end time and start time in whole quarters.

##### Syntax (`QDIFF`)

```
QDIFF(<end_datetime_field>, <start_datetime_field>)

```

- `end_datetime_filed`: Ending time to take the difference from
- `start_datetime_field`: Starting time to take the difference from

##### Example (`QDIFF`)

Calculate the difference in quarters from the time of entering to the time of leaving.

```
QDIFF([Leave Time], [Enter Time])

```

---

#### Year Difference (`YDIFF`)

Calculates the difference between an end time and start time in whole years.

##### Syntax (`YDIFF`)

```
YDIFF(<end_datetime_field>, <start_datetime_field>)

```

- `end_datetime_filed`: Ending time to take the difference from
- `start_datetime_field`: Starting time to take the difference from

##### Example (`YDIFF`)

Calculate the difference in years from the time of entering to the time of leaving.

```
YDIFF([Leave Time], [Enter Time])

```

---

#### Past Week Difference (`DIFFPASTWEEK`)

Calculates the difference between this week's data and the data from the previous week.

Use this function when the [date resolution](#date-resolution) used in your query is day or week.

- For day resolution, calculates the sales in the current day minus the sales in the same day one week ago.
- For week resolution, calculates the sales in current week minus the sales in previous week.

##### Syntax (`DIFFPASTWEEK`)

```
DIFFPASTWEEK(<numeric_field>)

```

##### Example (`DIFFPASTWEEK`)

Calculate the difference between this week's sales and the previous week's sales.

```
DIFFPASTWEEK([Total Sales])

```

---

#### Past Month Difference (`DIFFPASTMONTH`)

Calculates the difference between this month's data and the data from the previous month.

Use this function when the [date resolution](#date-resolution) used in your query is month, week, or day.

- For day resolution, calculates the sales in the current day minus the sales in the same day one month ago.
- For week resolution, calculates the sales in current week minus the sales in the same week one month ago.
- For month resolution, calculates the sales in the current month minus the sales in the previous month.

##### Syntax (`DIFFPASTMONTH`)

```
DIFFPASTMONTH(<numeric_field>)

```

##### Example (`DIFFPASTMONTH`)

Calculate the difference between this month's sales and the previous month's sales.

```
DIFFPASTMONTH([Total Sales])

```

---

#### Past Quarter Difference (`DIFFPASTQUARTER`)

Calculates the difference between this quarter's data and the data from the previous quarter.

Use this function when the [date resolution](#date-resolution) used in your query is month, quarter, week, or day.

- For day resolution, calculates the sales in the current day minus the sales in the same day one quarter ago.
- For week resolution, calculates the sales in current week minus the sales in the same week one quarter ago.
- For month resolution, calculates the sales in current month minus the sales in the same month one quarter ago.
- For quarter resolution, calculates the sales in the current quarter minus the sales in the previous quarter.

##### Syntax (`DIFFPASTQUARTER`)

```
DIFFPASTQUARTER(<numeric_field>)

```

##### Example (`DIFFPASTQUARTER`)

Calculate the difference between this quarter's sales and the previous quarter's sales.

```
DIFFPASTQUARTER([Total Sales])

```

---

#### Past Year Difference (`DIFFPASTYEAR`)

Calculates the difference between this year's data and the data from the previous year.

You can use this function with any [date resolution](#date-resolution) (day, week, month, quarter, or year) in your query.

- For day resolution, calculates the sales in the current day minus the sales in the same day one year ago.
- For month resolution, calculates the sales in current month minus the sales in the same month one year ago.
- For week resolution, calculates the sales in current week minus the sales in the same week one year ago.
- For quarter resolution, calculates the sales in the current quarter minus the sales in the previous quarter.
- For year resolution, calculates the sales in the current year minus the sales in the previous year.

##### Syntax (`DIFFPASTYEAR`)

```
DIFFPASTYEAR(<numeric_field>)

```

##### Example (`DIFFPASTYEAR`)

Calculate the difference between this year's sales and the previous year's sales.

```
DIFFPASTYEAR([Total Sales])

```

---

#### Past Period Difference (`DIFFPASTPERIOD`)

Calculates the difference between this period's data and the data from the previous period.

You can use this function with any [date resolution](#time-related-functions) (day, week, month, quarter, or year) in your query.

##### Syntax (`DIFFPASTPERIOD`)

```
DIFFPASTPERIOD(<numeric_field>)

```

##### Example (`DIFFPASTPERIOD`)

Calculate the difference between this period's sales and the previous period's sales.

```
DIFFPASTPERIOD([Total Sales])

```

---

#### Growth (`GROWTH`)

Calculates growth over a period of time.

You can use this function with any [date resolution](#date-resolution) (day, week, month, quarter, or year) in your query.

Growth is calculated as the current period's value minus the previous period's value divided by the previous period's value (`(current - previous) / previous`). If the previous period's value is greater than the current period's value, the growth will be negative.

For example:

- If this period the value is 12 and the previous period's value was 10, the growth for this period is 20%, returned as '0.2' (calculation: (12 – 10) / 10 = 0.2).
- If this period the value is 80, and the previous period's value was 100, the growth for this period is -20%, returned as -0.2 (calculation: (80 – 100) / 100 = -0.2).

##### Syntax (`GROWTH`)

```
GROWTH(<numeric_field>)

```

##### Example (`GROWTH`)

Calculate the growth of total sales over a period of time.

```
GROWTH([Total Sales])

```

---

#### Growth Rate (`GROWTHRATE`)

Calculates growth rate over a period of time.

You can use this function with any [date resolution](#date-resolution) (day, week, month, quarter, or year) in your query.

Growth rate is calculated as the current period's value divided by the previous period's value (`current / previous`). If the previous period's value is greater than the current period's value, the growth rate will be less than `1`.

For example:

- If this period the value is 12 and the previous period's value was 10, the growth rate for this period is 120%, returned as '1.2' (calculation: 12 / 10 = 1.2).
- If this period the value is 80, and the previous period's value was 100, the growth for this period is 80%, returned as 0.8 (calculation: 80 / 100 = .8).

##### Syntax (`GROWTHRATE`)

```
GROWTHRATE(<numeric_field>)

```

##### Example (`GROWTHRATE`)

Calculate the growth rate of total sales over a period of time.

```
GROWTHRATE([Total Sales])

```

---

#### Growth Past Week (`GROWTHPASTWEEK`)

Calculates the growth from the past week to the current week.

Use this function when the [date resolution](#date-resolution) in your query is days or weeks.

- For day resolution, calculates the growth for the current day in comparison to the same day one week ago.
- For week resolution, calculates the growth for the current week in comparison to the previous week.

Growth is calculated as the current week's value minus the previous week's value divided by the previous week's value (`(current - previous) / previous`). If the previous week's value is greater than the current week's value, the growth will be negative.

For example:

- If this week the value is 12 and the previous week's value was 10, the growth for this week is 20%, returned as '0.2' (calculation: (12 – 10) / 10 = 0.2).
- If this week the value is 80, and the previous week's value was 100, the growth for this week is -20%, returned as -0.2 (calculation: (80 – 100) / 100 = -0.2).

##### Syntax (`GROWTHPASTWEEK`)

```
GROWTHPASTWEEK(<numeric_field>)

```

##### Example (`GROWTHPASTWEEK`)

Calculate the growth of total sales over the past week.

```
GROWTHPASTWEEK([Total Sales])

```

---

#### Growth Past Month (`GROWTHPASTMONTH`)

Calculates the growth from the past month to the current month.

Use this function when the [date resolution](#date-resolution) in your query is days, weeks, or months.

- For day resolution, calculates the growth for the current day in comparison to the same day one month ago.
- For week resolution, calculates the growth for the current week in comparison to the same week one month ago.
- For month resolution, calculates the growth for the current month in comparison to the previous month.

Growth is calculated as the current month's value minus the previous month's value divided by the previous month's value (`(current - previous) / previous`). If the previous month's value is greater than the current week's value, the growth will be negative.

For example:

- If this month the value is 12 and the previous month's value was 10, the growth for this month is 20%, returned as '0.2' (calculation: (12 – 10) / 10 = 0.2).
- If this month the value is 80, and the previous month's value was 100, the growth for this month is -20%, returned as -0.2 (calculation: (80 – 100) / 100 = -0.2).

##### Syntax (`GROWTHPASTMONTH`)

```
GROWTHPASTMONTH(<numeric_field>)

```

##### Example (`GROWTHPASTMONTH`)

Calculate the growth of total sales over the past month.

```
GROWTHPASTMONTH([Total Sales])

```

---

#### Growth Past Quarter (`GROWTHPASTQUARTER`)

Calculates the growth from the past quarter to the current quarter.

Use this function when the [date resolution](#date-resolution) in your query is days, months, weeks, or quarters.

- For day resolution, calculates the growth for the current day in comparison to the same day one month ago.
- For week resolution, calculates the growth for the current week in comparison to the same week one month ago.
- For month resolution, calculates the growth for the current month in comparison to the same month one quarter ago.
- For quarter resolution, calculates the growth for the current quarter in comparison to the previous quarter.

Growth is calculated as the current quarter's value minus the previous quarter's value divided by the previous quarter's value (`(current - previous) / previous`). If the previous quarter's value is greater than the current quarter's value, the growth will be negative.

For example:

- If this quarter the value is 12 and the previous quarter's value was 10, the growth for this quarter is 20%, returned as '0.2' (calculation: (12 – 10) / 10 = 0.2).
- If this quarter the value is 80, and the previous quarter's value was 100, the growth for this quarter is -20%, returned as -0.2 (calculation: (80 – 100) / 100 = -0.2).

##### Syntax (`GROWTHPASTQUARTER`)

```
GROWTHPASTQUARTER(<numeric_field>)

```

##### Example (`GROWTHPASTQUARTER`)

Calculate the growth of total sales over the past quarter.

```
GROWTHPASTQUARTER([Total Sales])

```

---

#### Growth Past Year (`GROWTHPASTYEAR`)

Calculates the growth from the past year to the current year.

Use this function when the [date resolution](#date-resolution) in your query is days, weeks, months, quarters, or years.

- For day resolution, calculates the growth for the current day in comparison to the same day one year ago.
- For week resolution, calculates the growth for the current week in comparison to the same week one year ago.
- For month resolution, calculates the growth for the current month in comparison to the same month one year ago.
- For quarter resolution, calculates the growth for the current quarter in comparison to the same quarter one year ago.
- For year resolution, calculates the growth for the current year in comparison to the previous year.

Growth is calculated as the current year's value minus the previous year's value divided by the previous year's value (`(current - previous) / previous`). If the previous year's value is greater than the current year's value, the growth will be negative.

For example:

- If this year the value is 12 and the previous year's value was 10, the growth for this year is 20%, returned as '0.2' (calculation: (12 – 10) / 10 = 0.2).
- If this year the value is 80, and the previous year's value was 100, the growth for this year is -20%, returned as -0.2 (calculation: (80 – 100) / 100 = -0.2).

##### Syntax (`GROWTHPASTYEAR`)

```
GROWTHPASTYEAR(<numeric_field>)

```

##### Example (`GROWTHPASTYEAR`)

Calculate the growth of total sales over the past year.

```
GROWTHPASTYEAR([Total Sales])

```

---

#### Past Day (`PASTDAY`)

Gets the value for a previous day. You can specify the number of days to go back. By default, gets the value for the previous day.

You can use this function when the [date resolution](#date-resolution) in your query is day.

##### Syntax (`PASTDAY`)

```
PASTDAY(<numeric_field>, [<number_of_periods>])

```

- `numeric_field`: Field to get the value from.
- `number_of_perionds`: Optional. The number of prior periods to use for the calculation. Defaults to the previous day.

##### Examples (`PASTDAY`)

Get the total sales value for yesterday.

```
PASTDAY([Total Sales])

```

Get the total sales value for 2 days ago.

```
PASTDAY([Total Sales], 2)

```

---

#### Past Week (`PASTWEEK`)

Returns the value for the same period in the previous week. You can specify the number of weeks to go back. By default, gets the value for the previous week.

You can use this function when the [date resolution](#date-resolution) in your query is day or week.

- For day resolution, gets the value for the current day in a previous week.
- For week resolution, gets the value for a previous week.

##### Syntax (`PASTWEEK`)

```
PASTWEEK(<numeric_field>, [<number_of_periods>])

```

- `numeric_field`: Field to get the value from.
- `number_of_perionds`: Optional. The number of prior periods to use for the calculation. Defaults to the previous week.

##### Examples (`PASTWEEK`)

Get the total sales value from last week.

```
PASTWEEK([Total Sales])

```

Get the total sales value from two weeks ago.

```
PASTWEEK([Total Sales], 2)

```

---

#### Past Month (`PASTMONTH`)

Returns the value for the same period in the previous month. You can specify the number of months to go back. By default, gets the value for the previous month.

You can use this function when the [date resolution](#date-resolution) in your query is day, week, or month.

- For day resolution, gets the value for the current day in a previous month.
- For week resolution, gets the value for the current week in a previous month.
- For month resolution, gets the value for a previous month.

##### Syntax (`PASTMONTH`)

```
PASTMONTH(<numeric_field>, [<number_of_periods>])

```

- `numeric_field`: Field to get the value from.
- `number_of_perionds`: Optional. The number of prior periods to use for the calculation. Defaults to the previous month.

##### Examples (`PASTMONTH`)

Get the total sales value from last month.

```
PASTMONTH([Total Sales])

```

Get the total sales value from two months ago.

```
PASTMONTH([Total Sales], 2)

```

---

#### Past Quarter (`PASTQUARTER`)

Returns the value for the same period in the previous quarter. You can specify the number of quarters to go back. By default, gets the value for the previous quarter.

You can use this function when the [date resolution](#date-resolution) in your query is day, week, month, or quarter.

- For day resolution, gets the value for the current day in a previous quarter.
- For week resolution, gets the value for the current week in a previous quarter.
- For month resolution, gets the value for the current month in a previous quarter.
- For quarter resolution, gets the value for a previous quarter.

##### Syntax (`PASTQUARTER`)

```
PASTQUARTER(<numeric_field>, [<number_of_periods>])

```

- `numeric_field`: Field to get the value from.
- `number_of_perionds`: Optional. The number of prior periods to use for the calculation. Defaults to the previous quarter.

##### Examples (`PASTQUARTER`)

Get the total sales value from last quarter.

```
PASTQUARTER([Total Sales])

```

Get the total sales value from two quarters ago.

```
PASTQUARTER([Total Sales], 2)

```

---

#### Past Year (`PASTYEAR`)

Returns the value for the same period in the previous year. You can specify the number of years to go back. By default, gets the value for the previous year.

You can use this function when the [date resolution](#date-resolution) in your query is day, week, month, quarter, or year.

- For day resolution, gets the value for the current day in a previous year.
- For week resolution, gets the value for the current week in a previous year.
- For month resolution, gets the value for the current month in a previous year.
- For quarter resolution, gets the value for the current month in a previous year.
- For year resolution, gets the value for a previous year.

##### Syntax (`PASTYEAR`)

```
PASTYEAR(<numeric_field>, [<number_of_periods>])

```

- `numeric_field`: Field to get the value from.
- `number_of_perionds`: Optional. The number of prior periods to use for the calculation. Defaults to the previous year.

##### Examples (`PASTYEAR`)

Get the total sales value from last year.

```
PASTYEAR([Total Sales])

```

Get the total sales value from two years ago.

```
PASTYEAR([Total Sales], 2)

```

---

#### Week to Date Average (`WTDAVG`)

Calculates a running average starting from the beginning of the week up to the current day.

You can use this function when the [date resolution](#date-resolution) in your query is day.

##### Syntax (`WTDAVG`)

```
WTDAVG(<numeric_field>)

```

##### Example (`WTDAVG`)

Calculate the running average of total sales starting from the beginning of the week up to the current day.

```
WTDAVG([Total Sales])

```

---

#### Week to Date Sum (`WTDSUM`)

Calculates a running sum starting from the beginning of the week up to the current day.

You can use this function when the [date resolution](#date-resolution) in your query is day.

##### Syntax (`WTDSUM`)

```
WTDSUM(<numeric_field>)

```

##### Example (`WTDSUM`)

Calculate the running sum of total sales starting from the beginning of the week up to the current day.

```
WTDSUM([Total Sales])

```

---

#### Month to Date Average (`MTDAVG`)

Calculates a running average starting from the beginning of the month up to the current day or week.

You can use this function when the [date resolution](#date-resolution) in your query is days or weeks.

- For day resolution, gets the running average from the beginning of the year up to the current day.
- For week resolution, gets the running average from the beginning of the year up to the current week.

##### Syntax (`MTDAVG`)

```
MTDAVG(<numeric_field>)

```

##### Example (`MTDAVG`)

Calculate the running average of total sales starting from the beginning of the month up to the current day or week.

```
MTDAVG([Total Sales])

```

---

#### Month to Date Sum (`MTDSUM`)

Calculates a running sum starting from the beginning of the month up to the current day or week.

You can use this function when the [date resolution](#date-resolution) in your query is days or weeks.

- For day resolution, gets the running sum from the beginning of the year up to the current day.
- For week resolution, gets the running sum from the beginning of the year up to the current week.

##### Syntax (`MTDSUM`)

```
MTDSUM(<numeric_field>)

```

##### Example (`MTDSUM`)

Calculate the running average of total sales starting from the beginning of the month up to the current day or week.

```
MTDSUM([Total Sales])

```

---

#### Quarter to Date Average (`QTDAVG`)

Calculates a running average starting from the beginning of the quarter up to the current day, week, or month.

You can use this function when the [date resolution](#date-resolution) in your query is days, weeks, or months.

- For day resolution, gets the running average from the beginning of the year up to the current day.
- For week resolution, gets the running average from the beginning of the year up to the current week.
- For month resolution, gets the running average from the beginning of the year up to the current month.

##### Syntax (`QTDAVG`)

```
QTDAVG(<numeric_field>)

```

##### Example (`QTDAVG`)

Calculate the running average of total sales starting from the beginning of the quarter up to the current day, week, or month.

```
QTDAVG([Total Sales])

```

---

#### Quarter to Date Sum (`QTDSUM`)

Calculates a running sum starting from the beginning of the quarter up to the current day, week, or month.

You can use this function when the [date resolution](#date-resolution) in your query is days, weeks, or months.

- For day resolution, gets the running sum from the beginning of the year up to the current day.
- For week resolution, gets the running sum from the beginning of the year up to the current week.
- For month resolution, gets the running sum from the beginning of the year up to the current month.

##### Syntax (`QTDSUM`)

```
QTDSUM(<numeric_field>)

```

##### Example (`QTDSUM`)

Calculate the running sum of total sales starting from the beginning of the quarter up to the current day, week, or month.

```
QTDSUM([Total Sales])

```

---

#### Year to Date Average (`YTDAVG`)

Calculates a running average starting from the beginning of the year up to the current day week, month, or quarter.

You can use this function when the [date resolution](#date-resolution) in your query is days, weeks, months, or quarters.

- For day resolution, gets the running average from the beginning of the year up to the current day.
- For week resolution, gets the running average from the beginning of the year up to the current week.
- For month resolution, gets the running average from the beginning of the year up to the current month.
- For quarter resolution, gets the running average from the beginning of the year up to the current quarter.

##### Syntax (`YTDAVG`)

```
YTDAVG(<numeric_field>)

```

##### Example (`YTDAVG`)

Calculate the running average of total sales starting from the beginning of the year up to the current day, week, month, or quarter.

```
YTDAVG([Total Sales])

```

---

#### Year to Date Sum (`YTDSUM`)

Calculates a running sum starting from the beginning of the year up to the current day week, month, or quarter.

You can use this function when the [date resolution](#date-resolution) in your query is days, weeks, months, or quarters.

- For day resolution, gets the running sum from the beginning of the year up to the current day.
- For week resolution, gets the running sum from the beginning of the year up to the current week.
- For month resolution, gets the running sum from the beginning of the year up to the current month.
- For quarter resolution, gets the running sum from the beginning of the year up to the current quarter.

##### Example (`YTDSUM`)

Calculate the running sum of total sales starting from the beginning of the year up to the current day, week, month, or quarter.

```
YTDSUM([Total Sales])

```

---

### Measured Value Functions

Formulas often need to take into account specific criteria. To do this, Sisense provides a feature called Measured Values. A measured value only performs a calculation when the values in a field meet specific criteria. Criteria for measured values can be based on any logical operators in a filter.

Measured values are used to:

- Cancel the filters in a formula
- Cancel the grouping in a formula

---

#### All (`ALL`)

Changes the scope of a measure calculation to ignore grouping and filters while calculating a formula.

##### Syntax (`ALL`)

```
ALL(<any_field_type>)

```

- `any_field_type`: Any groupable field.

##### Example (`ALL`)

Calculates the total revenue for all years together, despite any grouping or filtering by years.

```
SUM([Revenue]), ALL([Years in Date]);

```

---

#### Previous (`PREV`)

Gets the time period member in a time field which is a specified number of periods before the current member. By default, if no number of periods is specified, the immediately previous period is retrieved.

This function works will all [date resolutions](#date-resolution). However, the active date resolution of the query must match the date resolution in the function.

##### Syntax (`PREV`)

```
PREV(<datetime_field>, [<n>])

```

- `datetime_field`: Any field containing a datetime.
- `n`: Optional. The number of periods to go back.

##### Examples (`PREV`)

Get the total quantity for the previous month when grouping by month.

```
(SUM([Quantity]), PREV([Months in Date]))

```

Get the total quantity for 2 months proir when grouping by month.

```
(SUM([Quantity]), PREV([Months in Date], 2))

```

---

#### Next (`NEXT`)

Gets the time period member in a time field which is a specified number of periods after the current member. By default, if no number of periods is specified, the immediately next period is retrieved.

This function works will all [date resolutions](#date-resolution). However, the active date resolution of the query must match the date resolution in the function.

##### Syntax (`NEXT`)

```
PREV(<datetime_field>, [<n>])

```

- `datetime_field`: Any field containing a datetime.
- `n`: Optional. The number of periods to go forward.

##### Example (`NEXT`)

Get the total quantity for the next month when grouping by month.

```
(SUM([Quantity]), NEXT([Months in Date]))

```

Get the total quantity for 2 months later when grouping by month.

```
(SUM([Quantity]), NEXT([Months in Date], 2))

```

---

#### Now (`NOW`)

Gets the time period member in a time field which matches the current query execution time.

This function works will all [date resolutions](#date-resolution). However, the active date resolution of the query must match the date resolution in the function.

##### Syntax (`NOW`)

```
NOW(<datetime_field>)

```

##### Example (`NOW`)

Get the total quantity for the current month when grouping by month.

```
(SUM([Quantity]), NOW([Months in Date]))

```

---

### Other Functions

Additional functions for conditionals, null checking, and more.

#### Case (`CASE`)

Returns the result expression of the first condition that evaluates as true. If none of the conditions are true, the `ELSE` result expression for the is returned if one is specified.

##### Syntax (`CASE`)

```
(WHEN <condition> THEN <result_expression_true> [...] [ELSE <result expression_false>] END)

```

- `condition`: Boolean expression.
- `result_expression_true`: Any number, formula, or function that is returned when the `condition` is true.
- `result_expression_false`: Any number, formula, or function that is returned when the `condition` is false.

#### Examples (`CASE`)

Return 1 when the total sales is less than 100. Return 2 if total sales value is 100 or greater.

```
CASE WHEN SUM([Sales]) < 100 THEN 1 ELSE 2 END

```

Return 1 when the total sales is less than 100. Return 2 if total sales value is between 100 and 1000. Return 3 in when total sales are above 1000.

```
CASE WHEN SUM([Sales]) < 100 THEN 1 WHEN SUM ([Sales]) < 1000 THEN 2 ELSE 3 END

```

---

#### If (`IF`)

Returns the first expression when the condition is true and it returns the second expression when the condition is false. Nested conditional statements are supported.

##### Syntax (`IF`)

```
IF(<condition>, <numeric_expression_true>, <numeric_expression_false>)

```

- `condition`: Boolean expression.
- `numeric_expression_true`: Numeric expression that is evaluated when the `condition` is true.
- `numeric_expression_true`: Numeric expression that is evaluated when the `condition` is false.

##### Example (`IF`)

If total sales is larger than 100, return the Total Sales x 1.1 (sales increase of 10%). Otherwise, return the total sales without an increase.

```
IF(SUM([Sales]) > 100, SUM([Sales]) * 1.1, SUM([Sales]))

```

---

#### Is Null (`ISNULL`)

Returns true if the expression does not contain data.

##### Syntax (`ISNULL`)

```
ISNULL(<numeric_field>)

```

##### Example (`ISNULL`)

```
If (ISNULL(SUM([Sales])), 0, SUM([Sales]) )

```

---

#### Now (`NOW`)

Returns the current execution time.

##### Syntax (`NOW`)

```
NOW()

```

##### Example (`NOW`)

Get the hour difference from enter time until now.

```
HDiff(NOW(), [Enter Time])

```

#### Running Average (`RAVG`)

Returns the running average of the given values according to the query's sorting order.

By default, `RAVG` averages a measure by the sorting order of the query's dimension. To average by another order, add the relevant measure to the query and by that measure.

You can specify a boolean value to indicate whether to calculate the average continuously when there are two or more dimensions. By default, the average is not calculated continuously.

##### Syntax (`RAVG`)

```
RAVG(<numeric_field>, [<continuous>])

```

- `numeric_field`: Field to calculate the running average for.
- `continuous`: Optional. A boolean value that determines whether to calculate the average continuously when there are two or more dimensions. Defaults to `FALSE`.

##### Example (`RAVG`)

Get the running average of the total revenue.

```
RAVG([Total Revenue])

```

---

#### Running Sum (`RSUM`)

Returns the running sum of the given values according to the query's sorting order.

By default, `RSUM` accumulates a measure by the sorting order of the query's dimension. To accumulate by another order, add the relevant measure to the query and by that measure.

You can specify a boolean value to indicate whether to accumulate the sum continuously when there are two or more dimensions. By default, the sum is not accumulated continuously.

##### Syntax (`RSUM`)

```
RSUM(<numeric_field>, [<continuous>])

```

- `numeric_field`: Field to calculate the running sum for.
- `continuous`: Optional. A boolean value that determines whether to accumulate the sum continuously when there are two or more dimensions. Defaults to `FALSE`.

##### Example (`RSUM`)

Get the running total of the total revenue.

```
RSUM([Total Revenue])

```

---

## Fusion Elasticube-only Functions

These functions can **only** be used with Fusion ElastiCube datamodels (see [documentation](https://docs.sisense.com/main/SisenseLinux/data-sources.htm?tocpath=Data%20Sources%7C_____1#DataSourceConnectionTypes) for further details).

### Aggregative Functions

Functions that create aggregations.

---

#### Correlation (`CORREL`)

Calculates the correlation coefficient of two numeric fields.

##### Syntax (`CORREL`)

```
CORREL(<numeric_field_a>, <numeric_field_b>)

```

```
CORREL(<group_by_field>, <aggregation_a>, <aggregation_b>)

```

##### Examples (`CORREL`)

Calculate the correlation between revenue and cost.

```
CORREL([Revenue], [Cost]);

```

Calculate the correlation between the average revenue and average cost per product.

```
CORREL([Products], AVG([Revenue]), AVG([Cost]));

```

---

#### Covariance - Population (`COVARP`)

Calculates the population covariance of two numeric fields.

##### Syntax (`COVARP`)

```
COVARP(<numeric_field_a>, <numeric_field_b>)

```

```
COVARP(<group_by_field>, <aggregation_a>, <aggregation_b>)

```

##### Examples (`COVARP`)

Calculate the population covariance of revenue and cost.

```
COVARP([Revenue], [Cost]);

```

Calculate the population covariance of the average revenue and the average cost per product.

```
COVARP([Products], AVG([Revenue]), AVG([Cost]));

```

---

#### Covariance - Sample (`COVAR`)

Calculates the sample covariance of two numeric fields.

##### Syntax (`COVAR`)

```
COVAR(<numeric_field_a>, <numeric_field_b>)

```

```
COVAR(<group_by_field>, <aggregation_a>, <aggregation_b>)

```

##### Examples (`COVAR`)

Calculate the sample covariance of revenue and cost.

```
COVAR([Revenue], [Cost]);

```

Calculate the sample covariance of the average revenue and the average cost per product.

```
COVAR([Products], AVG([Revenue]), AVG([Cost]));

```

---

#### Skewness - Population (`SKEWP`)

Calculates the skewness of the distribution of a given value in a population.

##### Syntax (`SKEWP`)

```
SKEWP(<numeric_field>)

```

##### Example (`SKEWP`)

Calculate the skewness of the distribution of scores in a population.

```
SKEWP([Score]);

```

---

#### Skewness - Sample (`SKEW`)

Calculates the skewness of the distribution of a given value in a sample.

##### Syntax (`SKEW`)

```
SKEW(<numeric_field>)

```

##### Example (`SKEW`)

Calculate the skewness of the distribution of scores in a sample.

```
SKEW([Score]);

```

---

#### Slope (`SLOPE`)

Calculates the slope of a linear regression line through the provided series of x and y values.

##### Syntax (`SLOPE`)

```
SLOPE(<numeric_field>, <numeric_field>)

```

##### Example (`SLOPE`)

Calculate the slope of the regression line that represents a trend of items sold for each month.

```
SLOPE([month.int], [Total Sales])

```

---

### Statistical Functions

Functions that calculate statistical data.

---

#### Exponential Distribution (`EXPONDIST`)

Calculates the exponential distribution for a given value and a supplied distribution parameter lambda. Choose whether to use a cumulative distribution function by specifying `TRUE` or a probability density function by specifying `FALSE`.

##### Syntax (`EXPONDIST`)

```
EXPONDIST(<numeric_field>, <lambda>, <cumulative>)

```

- `<numeric_field>`: Any numeric field.
- `<lambda>`: Any number.
- `<cumulative>`: A boolean value. `TRUE` for cumulative distribution function. `FALSE` For probability density function.

##### Examples (`EXPONDIST`)

Calculate the cumulative exponential distribution density of the number of leads per country where lambda is 2.

```
EXPONDIST(COUNT([Leads]), 2, TRUE);

```

Calculate the probability exponential distribution density of the number of leads per country where lambda is 2.

```
EXPONDIST(COUNT([Leads]), 2, FALSE);

```

---

#### Intercept (`INTERCEPT`)

Calculates the intercept of a linear regression line through the provided series of x and y values.

##### Syntax (`INTERCEPT`)

```
INTERCEPT(<numeric_field>, <numeric_field>)

```

##### Example (`INTERCEPT`)

Calculate the intercept of the regression line that represents the trend of items sold for each month.

```
INTERCEPT([month.int], [Total Sales])

```

---

#### Normal Distribution (`NORMDIST`)

Calculates the standard normal distribution for a given value, a supplied distribution mean, and standard deviation. Choose whether to use a cumulative distribution function by specifying `TRUE` or a probability mass function by specifying `FALSE`.

##### Syntax (`NORMDIST`)

```
NORMDIST(SUM<numeric_field>, (Mean(<numeric_field>), All(<numeric_field>)),
(standard_deviation(<numeric_field>), All(<numeric field>)), <cumulative>)

```

- `numeric_field`: Any numeric field.
- `mean`: A number representing the distribution mean.
- `standard_deviation`: A number representing the standard deviation.
- `cumulative`: A boolean value. `TRUE` for cumulative distribution function. `FALSE` probability mass function.

##### Example (`NORMDIST`)

Calculate the normal probability density of a given student score.

```
NORMDIST([Score], (MEAN([Score]), ALL([Score])), (STDEV([Score]), ALL([Score])), FALSE);

```

---

#### Poisson Distribution (`POISSONDIST`)

Calculates the Poisson distribution for a given value and a supplied distribution mean. Choose whether to use a cumulative Poisson distribution function by specifying `TRUE` or a Poisson probability mass function by specifying `FALSE`.

##### Syntax (`POISSONDIST`)

```
POISSONDIST(<numeric_field>, <mean>, <cumulative>)

```

- `numeric_field`: Any numeric field.
- `mean`: A number representing the distribution mean.
- `cumulative`: A boolean value. `TRUE` for cumulative Poisson distribution function. `FALSE` Poisson probability mass function.

##### Example (`POISSONDIST`)

Calculate the Poisson probability density of a given number of scores.

```
POISSONDIST([Score], (MEAN([Score]), ALL([Score])), (STDEV([Score]), ALL([Score])), FALSE);

```

---

#### T Distribution (`TDIST`)

Calculates the T-distribution for a given value and a supplied number of degrees of freedom. Choose whether to use a cumulative distribution function by specifying `TRUE` or a probability density function by specifying `FALSE`.

##### Syntax (`TDIST`)

```
TDIST(<numeric field>, <degrees_freedom>, <cumulative>)

```

- `<numeric_field>`: Any numeric field.
- `<degrees_freedom>`: Any value representing the degrees of freedom.
- `<cumulative>`: A boolean value. `TRUE` for cumulative distribution function. `FALSE` for probability density function.

##### Example (`TDIST`)

Calculate a student's T-distribution of a given score, with 3 degrees of freedom.

```
TDIST([Score], 3, TRUE);

```

---

### Mathematical Functions

Functions that perform mathematical operations.

#### Hyperbolic Cosine (`COSH`)

Calculates the hyperbolic cosine of a given value.

##### Syntax (`COSH`)

```
COSH(<numeric_field>)

```

##### Example (`COSH`)

Calculates the hyperbolic cosine of the total revenue.

```
COSH([Total Revenue])

```

---

#### Hyperbolic Sine (`SINH`)

Calculates the hyperbolic sine of a given value.

##### Syntax (`SINH`)

```
SINH(<numeric_field>)

```

##### Example (`SINH`)

Calculates the hyperbolic sine of the total revenue.

```
SINH([Total Revenue])

```

---

#### Hyperbolic Tangent (`TANH`)

Calculates the hyperbolic tangent of a given value.

##### Syntax (`TANH`)

```
TANH(<numeric_field>)

```

##### Example (`TANH`)

Calculates the hyperbolic tangent of the total revenue.

```
TANH([Total Revenue])

```

---

### Other Functions

Additional functions for R expressions.

---

#### Ordering (`ORDERING`)

Calculates the numeric order position of rows sorted into ascending or descending order based on the specified. The expressions must be aggregated by applying the `MIN`/`MAX` functions.

##### Example (`ORDERING`)

```
ORDERING(MIN([Sales Person Name]), MIN([Days in Transaction_Date]), -1 * SUM([Sales]))

```

---

#### R Double (`RDOUBLE`)

Returns a numeric result for a given R expression and a list of numeric values. The R expression is passed to the running Rserve.

Syntax:

```
RDOUBLE(<R expression>, [<ordering>], <numeric value 1>, [<numeric value 2>, ..., <numeric value n>])
RDOUBLE(<recycle>, <R expression>, [<ordering>], <numeric value 1>, [<numeric value 2>, ..., <numeric value n>])

```

Arguments:

- `<R expression>`: Your R code, wrapped in double quotes. R expects the return type to be an array with the same size as the query's row count. Nulls will be used to make up for shorter arrays, and longer arrays will be trimmed. Use single quotes to wrap strings within your R code, so that there will be no double-quote collision with the quotes wrapping your R code.
- `<Numeric Field>`: Numeric values can be passed as arguments to your R code. All arguments are passed to R as a 1-based list named `args`. Each item in the list contains an array that represents the field. For example:
  - `args[[1]]` returns an array which represents the first field that was used as an argument
  - `args[[2]][3]` returns the 3rd data value within the 2nd field that was used as an argument
- `<Ordering>`: Optional. Defines the sort order in which numeric data is sent to R. The argument of the Ordering parameter can be an index in your data source or you can use the [`ORDERING()`](#ordering-ordering) function to determine the order of your fields. This function arranges the values of the arguments into ascending or descending order, breaking ties by further arguments. For example: `ORDERING([Total Sales], -1*[COUNT Salesman], MIN(<Office Name>))`
- `<recycle>`: Optional. Controls whether the results from R should be recycled (cached), so that consequent queries will not have to be recalculated unless they or the data have changed. Generally, behavior is automatically managed by the ElastiCube automatically. However, since R code might have non-deterministic components to it (such as randomality functions or date-specific functions), the ElastiCube cannot rely on a data set and function that has not changed not to return a different result in multiple executions.
  - `TRUE`: Default. Results will be cached for unchanged functions and data.
  - `FALSE`: Results will not be cached. Use this option if your R code contains randomality or other non-deterministic content.

##### Example (RDOUBLE)

Returns the k-means cluster (R expression) of the total cost and total revenue.

```
RDOUBLE("m <-log(matrix(unlist(args), ncol=2)); kmeans (m,3)$cluster", [Total Cost], [Total Revenue])

```

For additional discussion on using `RDOUBLE` and how to do advanced forecasting with R, see [this community post](https://community.sisense.com/kb/faqs/so-how-exactly-does-r-work-with-sisense/8817).

---

#### R Integer (`RINT`)

Returns an integer result for a given R expression and a list of numeric values. The R expression is passed to the running Rserve.

Syntax:

```
RINT(<R expression>, [<ordering>], <numeric value 1>, [<numeric value 2>, ..., <numeric value n>])
RINT(<recycle>, <R expression>, [<ordering>], <numeric value 1>, [<numeric value 2>, ..., <numeric value n>])

```

Arguments:

- `<R expression>`: Your R code, wrapped in double quotes. R expects the return type to be an array with the same size as the query's row count. Nulls will be used to make up for shorter arrays, and longer arrays will be trimmed. Use single quotes to wrap strings within your R code, so that there will be no double-quote collision with the quotes wrapping your R code.
- `<Numeric Field>`: Numeric values can be passed as arguments to your R code. All arguments are passed to R as a 1-based list named `args`. Each item in the list contains an array that represents the field. For example:
  - `args[[1]]` returns an array which represents the first field that was used as an argument
  - `args[[2]][3]` returns the 3rd data value within the 2nd field that was used as an argument
- `<Ordering>`: Optional. Defines the sort order in which numeric data is sent to R. The argument of the Ordering parameter can be an index in your data source or you can use the [`ORDERING()`](#ordering-ordering) function to determine the order of your fields. This function arranges the values of the arguments into ascending or descending order, breaking ties by further arguments. For example: `ORDERING([Total Sales], -1*[COUNT Salesman], MIN(<Office Name>))`
- `<recycle>`: Optional. Controls whether the results from R should be recycled (cached), so that consequent queries will not have to be recalculated unless they or the data have changed. Generally, behavior is automatically managed by the ElastiCube automatically. However, since R code might have non-deterministic components to it (such as randomality functions or date-specific functions), the ElastiCube cannot rely on a data set and function that has not changed not to return a different result in multiple executions.
  - `TRUE`: Default. Results will be cached for unchanged functions and data.
  - `FALSE`: Results will not be cached. Use this option if your R code contains randomality or other non-deterministic content.

##### Example (RINT)

Returns the k-means cluster (R expression) of the total cost and total revenue.

```
RINT("m <-log(matrix(unlist(args), ncol=2)); kmeans (m,3)$cluster", [Total Cost], [Total Revenue])

```

For additional discussion on using `RINT` and how to do advanced forecasting with R, see [this community post](https://community.sisense.com/kb/faqs/so-how-exactly-does-r-work-with-sisense/8817).

---

/**
 * @brief This file is to perform the data cleaning for each graph.
 */
import * as d3 from 'd3';
import { column_from_csv } from './csvReadIn.js';

/**
 * Categorizes a given year into predefined year ranges.
 *
 * @param {number} year - The year to categorize.
 * @returns {string} The label of the year range that the given year falls into, or 'Unknown' if the year does not fall into any predefined range.
 */
function categorizeYear(year)
{
  const yearRanges = [
    { start: 1985, end: 1989, label: '1985-1989' },
    { start: 1990, end: 1995, label: '1990-1995' },
    { start: 1996, end: 2000, label: '1996-2000' },
    { start: 2001, end: 2005, label: '2001-2005' },
    { start: 2006, end: 2010, label: '2006-2010' },
    { start: 2011, end: 2015, label: '2011-2015' },
    { start: 2016, end: 2020, label: '2016-2020' }
  ];

  for (const range of yearRanges)
  {
    if (year >= range.start && year <= range.end)
    {
      return range.label;
    }
  }
  return 'Unknown';
}

/**
 * @brief Categorizes a car make into a region.
 *
 * This function takes a car make as input and returns the region (Japanese, European, American, Korean, or Other)
 * that the make belongs to. The comparison is case-insensitive.
 *
 * @param {string} make - The car make to categorize.
 * @return {string} The region of the car make.
 */
function categoriesMake(make)
{
  make = make.toLowerCase();
  const JapaneseMakes = ['toyota', 'isuzu', 'honda', 'nissan', 'subaru', 'mazda', 'iszuzu', 'mitsubishi', 'suzuki', 'daihatsu', 'lexus', 'infiniti', 'acura', 'scion'];
  const EuropeanMakes = ['volkswagen', 'geo', 'rolls-royce', 'fisker', 'audi', 'bmw', 'mercedes-benz', 'porsche', 'volvo', 'saab', 'fiat', 'alfa', 'jaguar', 'land rover', 'mini', 'smart', 'bentley', 'rolls royce', 'aston martin', 'lotus', 'maserati', 'lamborghini', 'ferrari'];
  const AmericanMakes = ['ford', 'ram', 'chevrolet', 'dodge', 'jeep', 'chrysler', 'cadillac', 'lincoln', 'buick', 'gmc', 'plymouth', 'saturn', 'pontiac', 'oldsmobile', 'mercury', 'hummer', 'tesla'];
  const KoreanMakes = ['hyundai', 'kia', 'genesis', 'daewoo', 'ssangyong'];

  if (JapaneseMakes.includes(make)) return 'Japanese';
  if (EuropeanMakes.includes(make)) return 'European';
  if (AmericanMakes.includes(make)) return 'American';
  if (KoreanMakes.includes(make)) return 'Korean';
  return 'Other';
}

/**
 * Categorizes the given vehicle body description into a predefined category.
 *
 * @param {string} body - The description of the vehicle body.
 * @returns {string} - The category of the vehicle body. Returns 'Unknown' if the body is not provided,
 *                     or 'Other' if the body does not match any predefined categories.
 */
function categorizeBody(body)
{
  if (!body) return 'Unknown';
  const bodyLower = body.toLowerCase();
  const categories = ['coupe', 'sedan', 'suv', 'minivan', 'truck', 'van', 'wagon', 'hatchback', 'convertible', 'roadster', 'cab'];

  if (bodyLower.includes('koup')) return 'coupe';
  if (bodyLower.includes('navitgation')) return 'suv';
  if (bodyLower.includes('supercrew')) return 'truck';

  return categories.find(category => bodyLower.includes(category)) || 'Other';
}

/**
 * Categorizes the given odometer reading into predefined mileage ranges.
 *
 * @param {string|number} odometer - The odometer reading to categorize. Can be a string or number.
 * @returns {string} The label of the mileage range that the odometer reading falls into, or 'Unknown' if the input is invalid.
 */
function categoriesOdometer(odometer)
{
  // Odometer categories
  const odometerRanges = [
    { label: `0-1000 miles`, start: 0, end: 1000 },
    { label: `1000-5000 miles`, start: 1000, end: 5000 },
    { label: `5000-10000 miles`, start: 5000, end: 10000 },
    { label: `10000-50000 miles`, start: 10000, end: 50000 },
    { label: `50000-100000 miles`, start: 50000, end: 100000 },
    { label: `100000-120000 miles`, start: 100000, end: 120000 },
    { label: `120000-160000 miles`, start: 120000, end: 160000 },
    { label: `160000-180000 miles`, start: 160000, end: 180000 },
    { label: `180000-200000 miles`, start: 180000, end: 200000 },
    { label: `200000+ miles`, start: 200000, end: Infinity }
  ];

  if (!odometer) return 'Unknown';
  // Make odometer into the ranges
  const odometerNum = parseInt(odometer);
  if (isNaN(odometerNum))
  {
    return 'Unknown';
  }
  else
  {
    for (const range of odometerRanges)
    {
      if (odometerNum >= range.start && odometerNum <= range.end)
      {
        return range.label;
      }
    }
  }
}

/**
 * Categorizes a given price into predefined price ranges.
 *
 * @param {string|number} price - The price to categorize. Can be a string or number.
 * @returns {string} The label of the price range the given price falls into, or 'Unknown' if the price is invalid.
 */
function categoriesPrice(price)
{
  const priceRanges = [
    { start: 0, end: 1000, label: '$0-$1000' },
    { start: 1001, end: 5000, label: '$1001-$5000' },
    { start: 5001, end: 10000, label: '$5001-$10000' },
    { start: 10001, end: 20000, label: '$10001-$20000' },
    { start: 20001, end: 30000, label: '$20001-$30000' },
    { start: 30001, end: 40000, label: '$30001-$40000' },
    { start: 40001, end: 50000, label: '$40001-$50000' },
    { start: 50001, end: 60000, label: '$50001-$60000' },
  ];

  if (!price) return 'Unknown';
  const priceNum = parseInt(price);
  if (isNaN(priceNum))
  {
    return 'Unknown';
  }
  else
  {
    for (const range of priceRanges)
    {
      if (priceNum >= range.start && priceNum <= range.end)
      {
        return range.label;
      }
    }
  }
}

/**
 * Cleans the data for graph 1 by categorizing and filtering unique entries.
 *
 * @function graph1_data_cleaning
 * @returns {Array<Object>} An array of cleaned data objects with unique year, region, and body combinations.
 *
 * @remarks
 * This function processes the data by categorizing the year, region, body, odometer, and price fields.
 * It ensures that only unique combinations of year, region, and body are included in the final output.
 * The odometer and price fields are categorized into numeric ranges.
 */
export function graph1_data_cleaning()
{
  const uniqueEntries = new Set();
  return column_from_csv.map(d =>
  {
    const year = categorizeYear(d.year);
    const region = categoriesMake(d.make);
    const body = categorizeBody(d.body);
    const odometer = categoriesOdometer(d.odometer);
    const price = categoriesPrice(d.price);
    const uniqueKey = `${ year }-${ region }-${ body }`;
    if (!uniqueEntries.has(uniqueKey))
    {
      uniqueEntries.add(uniqueKey);
      return {
        year: year, // Categorical (Year Ranges)
        region: region, // Categorical (Region)
        body: body, // Categorical (Body Type)
        odometer: odometer, // Categorical Ranges (Mileage Range)
        price: price // Categorical Ranges (Price Range)
      };
    }
    return null;
  }).filter(d => d !== null);  // Filter out null entries
}

/**
 * Cleans and processes graph data by grouping and averaging prices.
 *
 * @function
 * @name Graph2_data_cleaning
 * @returns {Object} An object containing two properties:
 * - `CategoricalYearWithPrice`: An array of objects with `year` and `price` properties, representing the average price for each year range.
 * - `YearWithAvgPrice`: An array of objects with `year` and `price` properties, representing the average price for each individual year.
 */
export function Graph2_data_cleaning()
{
  // Group the data by the year and price categories
  const dataGrouped = d3.group(column_from_csv, d => categorizeYear(d.year));

  // Get the average price for each year range
  const CategoricalYearWithPrice = Array.from(dataGrouped, ([yearRange, values]) =>
  {
    const totalPrices = values.reduce((sum, d) => sum + parseInt(d.price), 0);
    const averagePrice = totalPrices / values.length;
    return {
      year: yearRange,
      price: averagePrice
    };
  });

  // Group the data by the year
  const SingleYearWithPrice = d3.group(column_from_csv, d => d.year);

  // Get the average price for each year
  const YearWithAvgPrice = Array.from(SingleYearWithPrice, ([year, values]) =>
  {
    const totalPrices = values.reduce((sum, d) => sum + parseInt(d.price), 0);
    const averagePrice = totalPrices / values.length;
    const ActuralYear = year;
    return {
      year: ActuralYear,
      price: averagePrice
    };
  }).filter(d => d !== null);

  return { CategoricalYearWithPrice, YearWithAvgPrice };
}

/**
 * Cleans and processes graph data for visualization.
 *
 * This function counts the number of cars in each make category and each individual make,
 * then converts the resulting Maps to arrays suitable for use in a pie chart.
 *
 * @returns {Object} An object containing two arrays:
 * - `region`: An array of objects representing the count of cars in each make category.
 * - `manufactor`: An array of objects representing the count of cars for each individual make.
 */
export function Graph3_data_cleaning()
{
  // Count the number of cars in each make category
  const makeCategoryCount = d3.rollup(column_from_csv, v => v.length, d => categoriesMake(d.make));

  // Count the number of cars in each individual make
  const makeCount = d3.rollup(column_from_csv, v => v.length, d => d.make);

  // Convert the Maps to arrays for the pie chart
  const region = Array.from(makeCategoryCount, ([category, count]) => ({ category, count }));
  const manufactor = Array.from(makeCount, ([make, count]) => ({ make, count }));

  return { region, manufactor };
}

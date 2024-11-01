import * as d3 from 'd3';
import { column_from_csv } from './csvReadIn.js';


function categorizeYear(year)
{
  const yearRanges = [
    { start: 1980, end: 1985, label: '1980-1985' },
    { start: 1986, end: 1990, label: '1986-1990' },
    { start: 1991, end: 1995, label: '1991-1995' },
    { start: 1996, end: 2000, label: '1996-2000' },
    { start: 2001, end: 2005, label: '2001-2005' },
    { start: 2006, end: 2010, label: '2006-2010' },
    { start: 2011, end: 2015, label: '2011-2015' },
    { start: 2016, end: 2020, label: '2016-2020' },
    { start: 2021, end: 2025, label: '2021-2025' }
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

function categoriesOdometer(odometer)
{
  // Odometer categories
  const odometerRanges = [
    { label: `0-1000 miles`, start: 0, end: 1000 },
    { label: `1000-5000 miles`, start: 1000, end: 5000 },
    { label: `5000-10000 miles`, start: 5000, end: 10000 },
    { label: `10000-20000 miles`, start: 10000, end: 20000 },
    { label: `20000-40000 miles`, start: 20000, end: 40000 },
    { label: `40000-60000 miles`, start: 40000, end: 60000 },
    { label: `60000-80000 miles`, start: 60000, end: 80000 },
    { label: `80000-100000 miles`, start: 80000, end: 100000 },
    { label: `100000-120000 miles`, start: 100000, end: 120000 },
    { label: `120000-140000 miles`, start: 120000, end: 140000 },
    { label: `140000-160000 miles`, start: 140000, end: 160000 },
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




export function graph1_data_cleaning()
{
  const uniqueEntries = new Set();
  return column_from_csv.map(d =>
  {
    const year = categorizeYear(d.year);
    const make = categoriesMake(d.make);
    const body = categorizeBody(d.body);
    const odometer = categoriesOdometer(d.odometer);
    const price = categoriesPrice(d.price);
    const uniqueKey = `${ year }-${ make }-${ body }`;
    if (!uniqueEntries.has(uniqueKey))
    {
      uniqueEntries.add(uniqueKey);
      return {
        year: year,
        make: make,
        body: body,
        odometer: odometer,
        price: price
      };
    }
    return null;
  }).filter(d => d !== null);  // Filter out null entries
}

/**
 * @brief The function `Graph2_data_cleaning` groups the data by odometer ranges and counts the number of cars in each range for each brand.
 * @returns {Object} An object containing the grouped data array and the total count of cars.
 */
export function Graph2_data_cleaning()
{
  // Group the data by odometer range and brand, and count the number of cars in each range for each brand
  const odometerBrandCount = d3.rollup(column_from_csv, v => v.length, d => categoriesOdometer(d.odometer), d => d.make);

  // Convert the Map to an array for tree map and merge duplicate brands
  const data = Array.from(odometerBrandCount, ([range, brands]) => ({
    range,
    brands: Array.from(brands, ([brand, count]) => ({ brand, count }))
      .reduce((acc, { brand, count }) =>
      {
        const existingBrand = acc.find(b => b.brand === brand);
        if (existingBrand)
        {
          existingBrand.count += count;
        } else
        {
          acc.push({ brand, count });
        }
        return acc;
      }, [])
  }));

  return { data };
}



/**
 * @brief The function `Graph3_data_cleaning` prepares the data for a pie chart.
 * @returns {Object} An object containing the counts of cars in each make category and each individual make.
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

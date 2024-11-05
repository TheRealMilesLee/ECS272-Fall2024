/**
 * @brief This file reads in the car_prices.csv file and filters out rows where the year, make, body, odometer, or price are missing or invalid.
 * @details The file is then sorted by year, make, body, odometer, and price.
 * @return column_from_csv - A sorted array of objects where each object represents a row in the csv file
 */
import * as d3 from 'd3';
export let column_from_csv = await d3.csv('../data/car_prices.csv', (d) =>
{
  return {
    year: isNaN(+d.year) ? null : +d.year,
    make: d.make || "Unspecified",
    body: d.body || "Unspecified",
    odometer: isNaN(+d.odometer) ? null : +d.odometer,
    price: isNaN(+d.sellingprice) ? null : +d.sellingprice
  };
}).then(data =>
{
  // Filter out rows where any critical values are missing or invalid (null)
  // or price is 0
  return data.filter(d =>
  {
    return d.year !== null && d.make !== "Unspecified"
      && d.body !== "Unspecified" && d.odometer !== null && d.price !== null && d.price !== 0;
  });
});
// Sort the data by year
column_from_csv.sort((a, b) => a.year - b.year);

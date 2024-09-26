import React, { useEffect, useState } from "react";
import SalesData from "./assets/sales_data.txt"

const SalesReport = () => {
  const [report, setReport] = useState(null);
  const [fileError, setFileError] = useState(null);

  useEffect(() => {
    // Fetch the sales data from the assets folder
    // fetch('/assets/sales_data.txt')
    fetch(SalesData)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((data) => {
        processFile(data);
      })
      .catch((error) => {
        setFileError("Error fetching the file: " + error.message);
        console.log("Error fetching the file: " + error.message);
      });
  }, []);

  // Function to parse data from file contents
  // const processFile = (content) => {
  //   // Split content by new lines and remove the header row
  //   const salesData = content
  //     .split("\n")
  //     .slice(1)
  //     .map((row) => {
  //       const [date, sku, unitPrice, quantity, totalPrice] = row.split(",");
  //       return {
  //         date: new Date(date.trim()),
  //         sku: sku.trim(),
  //         unitPrice: parseFloat(unitPrice.trim()),
  //         quantity: parseInt(quantity.trim()),
  //         totalPrice: parseFloat(totalPrice.trim()),
  //       };
  //     });

  //   generateReport(salesData);
  // };

  // Function to parse data from file contents
const processFile = (content) => {
  // Split content by new lines and remove the header row
  const salesData = content
    .split("\n")
    .slice(1)
    .map((row) => {
      const trimmedRow = row.trim();
      // Skip empty rows
      if (trimmedRow === "") return null; // Return null for empty rows

      const [date, sku, unitPrice, quantity, totalPrice] = trimmedRow.split(",");

      // Check if all necessary fields are present
      if (!date || !sku || !unitPrice || !quantity || !totalPrice) return null;

      return {
        date: new Date(date.trim()),
        sku: sku.trim(),
        unitPrice: parseFloat(unitPrice.trim()),
        quantity: parseInt(quantity.trim()),
        totalPrice: parseFloat(totalPrice.trim()),
      };
    })
    .filter(Boolean); // Remove null entries (empty rows)

  generateReport(salesData);
};


  // Function to generate the report based on sales data
  const generateReport = (salesData) => {
    const reports = {};
    salesData.forEach((sale) => {
      const month = `${sale.date.getMonth() + 1}-${sale.date.getFullYear()}`;
      if (!reports[month]) {
        reports[month] = { totalSales: 0, items: {} };
      }

      const monthData = reports[month];
      monthData.totalSales += sale.totalPrice;

      if (!monthData.items[sale.sku]) {
        monthData.items[sale.sku] = { quantity: 0, revenue: 0, orders: 0 };
      }

      monthData.items[sale.sku].quantity += sale.quantity;
      monthData.items[sale.sku].revenue += sale.totalPrice;
      monthData.items[sale.sku].orders++;
    });

    const summary = generateReportSummary(reports);
    setReport(summary);
  };

  const generateReportSummary = (reports) => {
    const summary = {};
    Object.keys(reports).forEach((month) => {
      const monthData = reports[month];
      summary[month] = {
        totalSales: monthData.totalSales,
        mostPopularItem: null,
        highestRevenueItem: null,
        minOrders: Infinity,
        maxOrders: -Infinity,
        avgOrders: 0,
      };

      let totalOrders = 0,
        itemCount = 0;

      Object.keys(monthData.items).forEach((item) => {
        const itemData = monthData.items[item];

        // Most popular item based on quantity
        if (!summary[month].mostPopularItem || itemData.quantity > monthData.items[summary[month].mostPopularItem].quantity) {
          summary[month].mostPopularItem = item;
        }

        // Item generating the most revenue
        if (!summary[month].highestRevenueItem || itemData.revenue > monthData.items[summary[month].highestRevenueItem].revenue) {
          summary[month].highestRevenueItem = item;
        }

        // Min, Max, and Avg orders calculation
        summary[month].minOrders = Math.min(summary[month].minOrders, itemData.orders);
        summary[month].maxOrders = Math.max(summary[month].maxOrders, itemData.orders);
        totalOrders += itemData.orders;
        itemCount++;
      });

      summary[month].avgOrders = totalOrders / itemCount;
    });

    return summary;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sales Report</h1>

      {fileError && <p className="text-red-500">{fileError}</p>}

      {report && (
        <div className="mt-6">
          {Object.keys(report).map((month, index) => (
            <div key={index} className="mb-6">
              <h2 className="text-xl font-semibold">Month: {month}</h2>
              <p>Total Sales: ${report[month].totalSales.toFixed(2)}</p>
              <p>Most Popular Item: {report[month].mostPopularItem}</p>
              <p>Highest Revenue Item: {report[month].highestRevenueItem}</p>
              <p>Min Orders: {report[month].minOrders}</p>
              <p>Max Orders: {report[month].maxOrders}</p>
              <p>Avg Orders: {report[month].avgOrders.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalesReport;

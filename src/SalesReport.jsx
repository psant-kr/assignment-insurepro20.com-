import React, { useEffect, useState } from "react";
import SalesData from "./assets/sales_data.txt";

const SalesReport = () => {
  const [report, setReport] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [totalStoreSales, setTotalStoreSales] = useState(0); // State to store total sales of the store

  useEffect(() => {
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
  const processFile = (content) => {
    const salesData = content
      .split("\n")
      .slice(1)
      .map((row) => {
        const trimmedRow = row.trim();
        if (trimmedRow === "") return null;
        const [date, sku, unitPrice, quantity, totalPrice] =
          trimmedRow.split(",");

        if (!date || !sku || !unitPrice || !quantity || !totalPrice)
          return null;

        return {
          date: new Date(date.trim()),
          sku: sku.trim(),
          unitPrice: parseFloat(unitPrice.trim()),
          quantity: parseInt(quantity.trim()),
          totalPrice: parseFloat(totalPrice.trim()),
        };
      })
      .filter(Boolean);

    generateReport(salesData);
  };

  // Function to generate the report based on sales data
  const generateReport = (salesData) => {
    const reports = {};
    let totalSales = 0; // Variable to track total sales of the store

    salesData.forEach((sale) => {
      const month = `${sale.date.getMonth() + 1}-${sale.date.getFullYear()}`;
      if (!reports[month]) {
        reports[month] = { totalSales: 0, items: {} };
      }

      const monthData = reports[month];
      monthData.totalSales += sale.totalPrice;
      totalSales += sale.totalPrice; // Add to total store sales

      if (!monthData.items[sale.sku]) {
        monthData.items[sale.sku] = { quantity: 0, revenue: 0, orders: 0 };
      }

      monthData.items[sale.sku].quantity += sale.quantity;
      monthData.items[sale.sku].revenue += sale.totalPrice;
      monthData.items[sale.sku].orders++;
    });

    setTotalStoreSales(totalSales); // Set the total sales of the store
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

        if (
          !summary[month].mostPopularItem ||
          itemData.quantity >
            monthData.items[summary[month].mostPopularItem].quantity
        ) {
          summary[month].mostPopularItem = item;
        }

        if (
          !summary[month].highestRevenueItem ||
          itemData.revenue >
            monthData.items[summary[month].highestRevenueItem].revenue
        ) {
          summary[month].highestRevenueItem = item;
        }

        summary[month].minOrders = Math.min(
          summary[month].minOrders,
          itemData.orders
        );
        summary[month].maxOrders = Math.max(
          summary[month].maxOrders,
          itemData.orders
        );
        totalOrders += itemData.orders;
        itemCount++;
      });

      summary[month].avgOrders = totalOrders / itemCount;
    });

    return summary;
  };

  return (
    <div className="min-h-screen bg-cyan-950 p-6">
      <h1 className="text-4xl font-bold mb-6 text-center text-white">
        Sales Report
      </h1>

      {fileError && <p className="text-red-500">{fileError}</p>}

      {/* Display Total Sales of the Store */}
      {totalStoreSales > 0 && (
        <div className="bg-[#d0f1ed] shadow-lg rounded-lg p-6 mb-8 border border-white text-center">
          <h2 className="text-3xl font-bold mb-2 text-green-600">
            Total Sales of the Store
          </h2>
          <p className="text-2xl font-semibold text-gray-900">
            ${totalStoreSales.toFixed(2)}
          </p>
        </div>
      )}

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys(report).map((month, index) => (
            <div
              key={index}
              className="bg-[#d0f1ed] shadow-lg rounded-lg p-6 border border-white text-left text-black"
            >
              <h2 className="text-xl font-semibold mb-4 text-[#953f9c]">
                Month: {month}
              </h2>
              <p className="text-lg mb-2">
                <span className="font-bold text-black">Total Sales:</span> $
                {report[month].totalSales.toFixed(2)}
              </p>
              <p className="text-lg mb-2">
                <span className="font-bold text-black">
                  Most Popular Item:
                </span>{" "}
                {report[month].mostPopularItem}
              </p>
              <p className="text-lg mb-2">
                <span className="font-bold text-black">
                  Highest Revenue Item:
                </span>{" "}
                {report[month].highestRevenueItem}
              </p>
              <p className="text-lg mb-2">
                <span className="font-bold text-black">Min Orders:</span>{" "}
                {report[month].minOrders}
                {" "}
                <span className="font-semibold text-black">units</span>
              </p>
              <p className="text-lg mb-2">
                <span className="font-bold text-black">Max Orders:</span>{" "}
                {report[month].maxOrders}
                {" "}
                <span className="font-semibold text-black">units</span>
              </p>
              <p className="text-lg">
                <span className="font-bold text-black">Avg Orders:</span>{" "}
                {report[month].avgOrders.toFixed(2)}
                {" "}
                <span className="font-semibold text-black">units</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalesReport;

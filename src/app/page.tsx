"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import dynamic from "next/dynamic";

const ECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// Funktion zur Formatierung großer Zahlen mit Tausendertrennzeichen
const formatNumber = (num: number) => {
  return num.toLocaleString();
};

const HomePage = () => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get JWT Token
        const jwtRes = await axios.get("/api/get-jwt");
        const token = jwtRes.data.token;

        // Get PV Systems
        const pvSystemsRes = await axios.get("/api/get-pv-systems", {
          params: { token },
        });
        const pvSystemId = pvSystemsRes.data.pvSystems[0].pvSystemId;

        // Get Aggregated Data
        const aggregatedDataRes = await axios.get("/api/get-aggregated-data", {
          params: { token, pvSystemId, from: "2023", to: "2024" },
        });

        setChartData(aggregatedDataRes.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const chartOptions = {
    title: {
      text: "Solar Energy Data",
    },
    tooltip: {
      trigger: "axis",
      position: (point: number[], params: any, dom: HTMLElement, rect: any, size: any) => {
        // 'point' is the mouse position
        const [x, y] = point;
        const { viewSize, contentSize } = size; // Size of the tooltip content and view size

        const tooltipWidth = contentSize[0];
        const tooltipHeight = contentSize[1];
        const viewWidth = viewSize[0];
        const viewHeight = viewSize[1];

        // Position tooltip horizontally to avoid going out of view
        let posX = x;
        if (x + tooltipWidth > viewWidth) {
          posX = viewWidth - tooltipWidth - 10; // Offset by 10 pixels from the edge
        }

        // Position tooltip vertically to avoid going out of view
        let posY = y;
        if (y + tooltipHeight > viewHeight) {
          posY = y - tooltipHeight - 10; // Offset by 10 pixels from the cursor
        } else if (y < tooltipHeight) {
          posY = 10; // Move tooltip slightly below the top edge
        }

        return [posX, posY];
      },
      formatter: (params: any) => {
        let tooltipText = `${params[0].axisValue}<br/>`;
        params.forEach((item: any) => {
          tooltipText += `${item.marker} ${item.seriesName}: ${formatNumber(item.data)} ${item.dataIndex < chartData[0].channels.length ? chartData[0].channels[item.dataIndex].unit : ''}<br/>`;
        });
        return tooltipText;
      },
    },
    xAxis: {
      type: "category",
      data: chartData.map((item) => item.logDateTime),
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: number) => formatNumber(value),
      },
    },
    series:
      chartData.length > 0
        ? chartData[0].channels.map((channel) => ({
            name: channel.channelName,
            type: "line",
            data: chartData.map(
              (item) =>
                item.channels.find(
                  (ch) => ch.channelName === channel.channelName
                )?.value ?? 0
            ),
          }))
        : [],
  };

  return (
    <div>
      <h1>Aggregated Solar Data Visualization</h1>
      <ECharts option={chartOptions} style={{ height: 400, width: "100%" }} />
    </div>
  );
};

export default HomePage;

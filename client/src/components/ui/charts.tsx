import React from "react";

// Gráfico de barras
export const BarChart = ({ 
  data, 
  index, 
  categories, 
  layout = "horizontal", 
  colors = ["blue", "green", "purple", "amber", "red"], 
  valueFormatter = (value) => value.toString(),
  className = "", 
  stack = false,
  showLegend = true
}) => {
  if (!data || data.length === 0) return <div>Sem dados disponíveis</div>;

  const maxValue = Math.max(...data.flatMap(item => 
    categories.map(category => item[category] || 0)
  ));

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          {categories.map((category, i) => (
            <div key={category} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm bg-${colors[i % colors.length]}-500`}></div>
              <span className="text-xs text-gray-600">{category}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex-grow relative">
        {layout === "horizontal" ? (
          // Horizontal layout (barras verticais)
          <div className="flex h-full">
            <div className="flex-grow flex">
              {data.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end items-center relative">
                  <div className="w-full flex flex-col justify-end items-center h-[90%]">
                    {stack ? (
                      // Stacked bars
                      <div className="w-2/3 flex flex-col-reverse">
                        {categories.map((category, catIndex) => {
                          const value = item[category] || 0;
                          const percentage = (value / maxValue) * 100;
                          return value > 0 ? (
                            <div 
                              key={category}
                              className={`w-full bg-${colors[catIndex % colors.length]}-500 rounded-sm hover:opacity-80 transition-opacity group`}
                              style={{ height: `${percentage}%` }}
                            >
                              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 pointer-events-none">
                                {category}: {valueFormatter(value)}
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      // Regular bars
                      <div className="w-full flex justify-around">
                        {categories.map((category, catIndex) => {
                          const value = item[category] || 0;
                          const percentage = (value / maxValue) * 100;
                          return (
                            <div key={category} className="w-1/4 flex flex-col justify-end">
                              <div 
                                className={`w-full bg-${colors[catIndex % colors.length]}-500 rounded-sm hover:opacity-80 transition-opacity group`}
                                style={{ height: `${percentage}%` }}
                              >
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 pointer-events-none">
                                  {category}: {valueFormatter(value)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="text-xs mt-2 text-gray-600 truncate w-full text-center" title={item[index]}>{item[index]}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Vertical layout (barras horizontais)
          <div className="h-full flex flex-col">
            {data.map((item, i) => (
              <div key={i} className="flex-1 flex items-center mb-2">
                <div className="w-[15%] text-xs text-right pr-2 text-gray-600 truncate" title={item[index]}>
                  {item[index]}
                </div>
                <div className="w-[85%] flex-grow">
                  {stack ? (
                    // Stacked bars
                    <div className="flex h-6">
                      {categories.map((category, catIndex) => {
                        const value = item[category] || 0;
                        const percentage = (value / maxValue) * 100;
                        return value > 0 ? (
                          <div 
                            key={category}
                            className={`h-full bg-${colors[catIndex % colors.length]}-500 rounded-sm hover:opacity-80 transition-opacity group relative`}
                            style={{ width: `${percentage}%` }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 absolute top-[-24px] right-0 bg-gray-800 text-white text-xs rounded px-2 py-1 pointer-events-none whitespace-nowrap">
                              {category}: {valueFormatter(value)}
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    // Regular bars
                    <div className="flex flex-col h-full space-y-1">
                      {categories.map((category, catIndex) => {
                        const value = item[category] || 0;
                        const percentage = (value / maxValue) * 100;
                        return (
                          <div key={category} className="flex items-center h-3">
                            <div 
                              className={`h-full bg-${colors[catIndex % colors.length]}-500 rounded-sm hover:opacity-80 transition-opacity group relative`}
                              style={{ width: `${percentage}%` }}
                            >
                              <div className="opacity-0 group-hover:opacity-100 absolute top-[-24px] right-0 bg-gray-800 text-white text-xs rounded px-2 py-1 pointer-events-none whitespace-nowrap">
                                {category}: {valueFormatter(value)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Gráfico de área
export const AreaChart = ({ 
  data, 
  index, 
  categories, 
  colors = ["blue", "purple", "green", "amber", "red"], 
  valueFormatter = (value) => value.toString(),
  className = "",
  showLegend = true,
  showGridLines = true,
  startEndOnly = true,
  showXAxis = true,
  showYAxis = true
}) => {
  if (!data || data.length === 0) return <div>Sem dados disponíveis</div>;

  const maxValue = Math.max(...data.flatMap(item => 
    categories.map(category => item[category] || 0)
  ));

  // Added padding to the top of the chart
  const yAxisHeight = maxValue * 1.2;
  
  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          {categories.map((category, i) => (
            <div key={category} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm bg-${colors[i % colors.length]}-500 opacity-70`}></div>
              <span className="text-xs text-gray-600">{category}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex-grow flex">
        {/* Y-axis labels */}
        {showYAxis && (
          <div className="w-[10%] flex flex-col justify-between">
            <div className="text-[10px] text-gray-500">{valueFormatter(yAxisHeight)}</div>
            <div className="text-[10px] text-gray-500">{valueFormatter(Math.round(yAxisHeight * 0.75))}</div>
            <div className="text-[10px] text-gray-500">{valueFormatter(Math.round(yAxisHeight * 0.5))}</div>
            <div className="text-[10px] text-gray-500">{valueFormatter(Math.round(yAxisHeight * 0.25))}</div>
            <div className="text-[10px] text-gray-500">0</div>
          </div>
        )}
        
        <div className={`flex-grow relative ${showYAxis ? 'ml-2' : ''}`}>
          {/* Grid lines */}
          {showGridLines && (
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="border-t border-gray-200 w-full h-0"></div>
              <div className="border-t border-gray-200 w-full h-0"></div>
              <div className="border-t border-gray-200 w-full h-0"></div>
              <div className="border-t border-gray-200 w-full h-0"></div>
              <div className="border-t border-gray-200 w-full h-0"></div>
            </div>
          )}
          
          {/* Chart area */}
          <div className="absolute inset-0 flex items-end">
            {categories.map((category, catIndex) => {
              const categoryData = data.map(item => item[category] || 0);
              
              // Create points for SVG polygon (area)
              let points = "";
              data.forEach((item, i) => {
                const x = (i / (data.length - 1)) * 100;
                const y = 100 - ((item[category] || 0) / yAxisHeight) * 100;
                points += `${x},${y} `;
              });
              // Close the polygon
              points += `100,100 0,100`;
              
              return (
                <svg key={category} className="absolute inset-0" preserveAspectRatio="none" viewBox="0 0 100 100">
                  {/* Area fill */}
                  <polygon 
                    points={points} 
                    className={`fill-${colors[catIndex % colors.length]}-500 opacity-20`}
                  />
                  
                  {/* Line */}
                  <polyline
                    points={points.split(' ').slice(0, data.length).join(' ')}
                    className={`stroke-${colors[catIndex % colors.length]}-500 stroke-2 fill-none`}
                  />
                  
                  {/* Data points */}
                  {data.map((item, i) => {
                    const x = (i / (data.length - 1)) * 100;
                    const y = 100 - ((item[category] || 0) / yAxisHeight) * 100;
                    
                    return (
                      <g key={i} className="group">
                        <circle 
                          cx={x} 
                          cy={y} 
                          r="1.5" 
                          className={`fill-${colors[catIndex % colors.length]}-500 group-hover:r-2.5 transition-all duration-200`}
                        />
                        <title>{category}: {valueFormatter(item[category] || 0)}</title>
                      </g>
                    );
                  })}
                </svg>
              );
            })}
          </div>
          
          {/* X-axis labels */}
          {showXAxis && (
            <div className="absolute -bottom-6 w-full flex justify-between text-xs text-gray-500">
              {startEndOnly ? (
                <>
                  <div>{data[0][index]}</div>
                  <div>{data[data.length - 1][index]}</div>
                </>
              ) : (
                data.map((item, i) => (
                  (i % Math.ceil(data.length / 10) === 0 || i === data.length - 1) && (
                    <div key={i} className="transform -translate-x-1/2" style={{ left: `${(i / (data.length - 1)) * 100}%` }}>
                      {item[index]}
                    </div>
                  )
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Gráfico de pizza
export const PieChart = ({ 
  data, 
  category, 
  index, 
  colors = ["#2563eb", "#10b981", "#9333ea", "#f59e0b", "#ef4444"], 
  valueFormatter = (value) => value.toString(),
  className = "",
  showLegend = true,
  showAnimation = false,
  showTooltip = false,
  variant = "default"
}) => {
  if (!data || data.length === 0) return <div>Sem dados disponíveis</div>;

  const total = data.reduce((sum, item) => sum + (item[category] || 0), 0);
  let startAngle = 0;

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      <div className="flex-grow flex items-center justify-center">
        <div className="relative" style={{ width: '80%', height: '80%', maxWidth: '250px', maxHeight: '250px' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {data.map((item, i) => {
              const value = item[category] || 0;
              if (value === 0) return null;
              
              const percentage = (value / total) * 100;
              const angle = (percentage / 100) * 360;
              const endAngle = startAngle + angle;
              
              // Calculate SVG arc path
              const x1 = 50 + 50 * Math.cos((startAngle - 90) * (Math.PI / 180));
              const y1 = 50 + 50 * Math.sin((startAngle - 90) * (Math.PI / 180));
              const x2 = 50 + 50 * Math.cos((endAngle - 90) * (Math.PI / 180));
              const y2 = 50 + 50 * Math.sin((endAngle - 90) * (Math.PI / 180));
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
              
              // Text position for percentage label
              const labelAngle = startAngle + (angle / 2);
              const labelRadius = 35; // Slightly inside the pie
              const labelX = 50 + labelRadius * Math.cos((labelAngle - 90) * (Math.PI / 180));
              const labelY = 50 + labelRadius * Math.sin((labelAngle - 90) * (Math.PI / 180));
              
              const result = (
                <g key={i} className="group">
                  <path 
                    d={pathData} 
                    className={`fill-${colors[i % colors.length]}-500 hover:opacity-80 transition-opacity cursor-pointer`}
                  />
                  {percentage >= 5 && (
                    <text 
                      x={labelX} 
                      y={labelY} 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      className="font-medium text-[8px] fill-white"
                    >
                      {Math.round(percentage)}%
                    </text>
                  )}
                  <title>{item[index]}: {valueFormatter(value)} ({Math.round(percentage)}%)</title>
                </g>
              );
              
              startAngle = endAngle;
              return result;
            })}
          </svg>
        </div>
      </div>
      
      {showLegend && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2 justify-items-center">
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm bg-${colors[i % colors.length]}-500`}></div>
              <span className="text-xs text-gray-600 truncate max-w-[120px]" title={item[index]}>
                {item[index]} ({Math.round((item[category] / total) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Gráfico de donut
export const DonutChart = ({ 
  data, 
  category, 
  index, 
  colors = ["#2563eb", "#10b981", "#9333ea", "#f59e0b", "#ef4444"], 
  valueFormatter = (value) => value.toString(),
  className = "",
  showLegend = true,
  thickness = 30, // Espessura do donut (0-50)
  showLabel = true,
  showAnimation = false,
  showTooltip = false,
  variant = "default",
  label = ""
}) => {
  if (!data || data.length === 0) return <div>Sem dados disponíveis</div>;

  const total = data.reduce((sum, item) => sum + (item[category] || 0), 0);
  let startAngle = 0;
  
  // Calculate inner radius for donut
  const outerRadius = 50;
  const innerRadius = outerRadius - thickness;

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      <div className="flex-grow flex items-center justify-center">
        <div className="relative" style={{ width: '80%', height: '80%', maxWidth: '250px', maxHeight: '250px' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Inner circle (hole) */}
            <circle cx="50" cy="50" r={innerRadius} className="fill-white" />
            
            {data.map((item, i) => {
              const value = item[category] || 0;
              if (value === 0) return null;
              
              const percentage = (value / total) * 100;
              const angle = (percentage / 100) * 360;
              const endAngle = startAngle + angle;
              
              // Calculate SVG arc path for donut
              const startRadians = (startAngle - 90) * (Math.PI / 180);
              const endRadians = (endAngle - 90) * (Math.PI / 180);
              
              const x1Outer = 50 + outerRadius * Math.cos(startRadians);
              const y1Outer = 50 + outerRadius * Math.sin(startRadians);
              const x2Outer = 50 + outerRadius * Math.cos(endRadians);
              const y2Outer = 50 + outerRadius * Math.sin(endRadians);
              
              const x1Inner = 50 + innerRadius * Math.cos(endRadians);
              const y1Inner = 50 + innerRadius * Math.sin(endRadians);
              const x2Inner = 50 + innerRadius * Math.cos(startRadians);
              const y2Inner = 50 + innerRadius * Math.sin(startRadians);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              // Path: move to outer start, arc to outer end, line to inner end, arc back to inner start, close
              const pathData = `
                M ${x1Outer} ${y1Outer}
                A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer}
                L ${x1Inner} ${y1Inner}
                A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x2Inner} ${y2Inner}
                Z
              `;
              
              // Text position for center display
              const labelAngle = startAngle + (angle / 2);
              const labelRadius = (innerRadius + outerRadius) / 2; // Middle of the donut thickness
              const labelX = 50 + labelRadius * Math.cos((labelAngle - 90) * (Math.PI / 180));
              const labelY = 50 + labelRadius * Math.sin((labelAngle - 90) * (Math.PI / 180));
              
              const result = (
                <g key={i} className="group">
                  <path 
                    d={pathData} 
                    className={`fill-${colors[i % colors.length]}-500 hover:opacity-80 transition-opacity cursor-pointer`}
                  />
                  {percentage >= 8 && (
                    <text 
                      x={labelX} 
                      y={labelY} 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      className="font-medium text-[8px] fill-white"
                    >
                      {Math.round(percentage)}%
                    </text>
                  )}
                  <title>{item[index]}: {valueFormatter(value)} ({Math.round(percentage)}%)</title>
                </g>
              );
              
              startAngle = endAngle;
              return result;
            })}
            
            {/* Center text */}
            <text x="50" y="46" textAnchor="middle" className="fill-gray-700 text-sm font-medium">Total</text>
            <text x="50" y="58" textAnchor="middle" className="fill-gray-800 text-lg font-bold">{total}</text>
          </svg>
        </div>
      </div>
      
      {showLegend && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2 justify-items-center">
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm bg-${colors[i % colors.length]}-500`}></div>
              <span className="text-xs text-gray-600 truncate max-w-[120px]" title={item[index]}>
                {item[index]} ({valueFormatter(item[category])})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Componente de lista de barras
export const BarList = ({ 
  data, 
  valueKey, 
  labelKey, 
  colors = ["blue", "green", "purple", "amber", "red"], 
  valueFormatter = (value) => value.toString(),
  className = ""
}) => {
  if (!data || data.length === 0) return <div>Sem dados disponíveis</div>;

  const maxValue = Math.max(...data.map(item => item[valueKey] || 0));
  
  return (
    <div className={`w-full h-full flex flex-col space-y-3 ${className}`}>
      {data.map((item, i) => {
        const value = item[valueKey] || 0;
        const percentage = (value / maxValue) * 100;
        
        return (
          <div key={i} className="flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700 truncate max-w-[70%]" title={item[labelKey]}>
                {item[labelKey]}
              </span>
              <span className="text-sm text-gray-600">
                {valueFormatter(value)}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div 
                className={`bg-${colors[i % colors.length]}-500 h-2.5 rounded-full`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
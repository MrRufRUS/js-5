let languages = [];

const color = d3.scaleOrdinal(d3.schemeCategory10);

function drawChart() {
    const svg = d3.select("svg");
    svg.selectAll("*").remove();

    const xAxisValue = d3.select("#xAxisSelect").property("value");
    const yAxisValues = Array.from(d3.select("#yAxisSelect").property("selectedOptions")).map(option => option.value);
    const chartType = d3.select("#chartTypeSelect").property("value");
    
    let data = Array.from(d3.group(languages, d => d[xAxisValue]), ([key, values]) => {
        return {
            [xAxisValue]: key,
            'Рейтинг': d3.sum(values, d => d.Рейтинг),
            'Октябрь 2023': d3.sum(values, d => d['Октябрь 2023']),
            'Октябрь 2022': d3.sum(values, d => d['Октябрь 2022'])
        };
    });

    data.sort((a, b) => b.Рейтинг - a.Рейтинг);

    const margin = {top: 20, right: 30, bottom: 40, left: 50};
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom - 100;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().range([0, width]).padding(0.1);
    const y = d3.scaleLinear().range([height, 0]);

    x.domain(data.map(d => d[xAxisValue]));

    const yValueIncludesOctober = yAxisValues.some(value => value.includes("Октябрь"));
    const yMaxValue = yValueIncludesOctober ? d3.max(data, d => Math.max(...yAxisValues.map(yVal => d[yVal]))) : d3.max(data, d => d3.max(yAxisValues.map(yVal => d[yVal])));

    if (yValueIncludesOctober) {
        y.domain([yMaxValue, 1]);
    } else {
        y.domain([0, yMaxValue]);
    }

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Value");

    if (chartType === "bar") {
        yAxisValues.forEach((yVal, index) => {
            g.selectAll(".bar" + index)
                .data(data)
                .enter().append("rect")
                .attr("class", "bar" + index)
                .attr("x", d => x(d[xAxisValue]) + index * (x.bandwidth() / yAxisValues.length))
                .attr("y", d => y(d[yVal]))
                .attr("width", x.bandwidth() / yAxisValues.length)
                .attr("height", d => height - y(d[yVal]))
                .attr("fill", color(index));
        });
    } else if (chartType === "scatter") {
        yAxisValues.forEach((yVal, index) => {
            g.selectAll(".dot" + index)
                .data(data)
                .enter().append("circle")
                .attr("class", "dot" + index)
                .attr("cx", d => x(d[xAxisValue]) + x.bandwidth() / 2)
                .attr("cy", d => y(d[yVal]))
                .attr("r", 5)
                .attr("fill", color(index));
        });
    }
}
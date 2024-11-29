// Fetch the sample data from the URL
d3.json("https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json").then(data => {
    console.log(data);

    // Select the dropdown element
    const dropdown = d3.select("#sample-dropdown");

    // Populate the dropdown with sample IDs
    data.names.forEach(sample => {
        dropdown.append("option")
            .text(sample)
            .property("value", sample);
    });

    // Initialize the dashboard with the first sample
    updateDashboard(data.names[0], data);
    
    // Update the dashboard when a new sample is selected
    dropdown.on("change", function() {
        const selectedSample = d3.select(this).property("value");
        updateDashboard(selectedSample, data);
    });

    // Function to update all the visualizations and metadata
    function updateDashboard(sample, data) {
        const sampleData = data.samples.filter(s => s.id === sample)[0];
        const metadata = data.metadata.filter(m => m.id == sample)[0];

        // Update the Bar Chart
        updateBarChart(sampleData);

        // Update the Bubble Chart
        updateBubbleChart(sampleData);

        // Update the Sample Metadata
        updateMetadata(metadata);
    }

    // Function to update the Bar Chart
    function updateBarChart(sampleData) {
        // Extract the top 10 OTUs
        const top10 = sampleData.sample_values
            .map((value, index) => ({
                otu_id: sampleData.otu_ids[index],
                sample_value: value,
                otu_label: sampleData.otu_labels[index]
            }))
            .sort((a, b) => b.sample_value - a.sample_value)
            .slice(0, 10);

        // Create the horizontal bar chart
        const trace = {
            x: top10.map(item => item.sample_value),
            y: top10.map(item => `OTU ${item.otu_id}`),
            text: top10.map(item => item.otu_label),
            type: 'bar',
            orientation: 'h'
        };

        const layout = {
            title: "Top 10 OTUs",
            margin: { t: 30, l: 150 }
        };

        Plotly.newPlot("bar-chart", [trace], layout);
    }

    // Function to update the Bubble Chart
    function updateBubbleChart(sampleData) {
        // Create the bubble chart
        const trace = {
            x: sampleData.otu_ids,
            y: sampleData.sample_values,
            text: sampleData.otu_labels,
            mode: 'markers',
            marker: {
                size: sampleData.sample_values,
                color: sampleData.otu_ids,
                colorscale: 'Earth'
            }
        };

        const layout = {
            title: "OTU Distribution",
            xaxis: { title: 'OTU ID' },
            yaxis: { title: 'Sample Value' },
            showlegend: false,
            hovermode: 'closest'
        };

        Plotly.newPlot("bubble-chart", [trace], layout);
    }

    // Function to update the Sample Metadata
    function updateMetadata(metadata) {
        const panel = d3.select("#sample-metadata");
        panel.html(""); // Clear previous metadata

        Object.entries(metadata).forEach(([key, value]) => {
            panel.append("p").text(`${key}: ${value}`);
        });
    }
});



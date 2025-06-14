// Helper functions for Dashboard

export const handleFileChange = (event, setSelectedFile, setParsingError, setCsvData) => {
  const file = event.target.files[0];
  if (file) {
    setSelectedFile(file);
    setParsingError(null); // Clear previous errors

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      try {
        // Basic CSV parsing: split by lines, then by commas.
        // Assumes simple CSV structure with no complex escaping.
        const lines = text.split("\n").filter((line) => line.trim() !== "");
        const parsedData = lines.map((line) =>
          line.split(",").map((cell) => cell.trim())
        );
        // Basic validation: check if there's at least a header row and data rows
        if (parsedData.length > 1) {
          setCsvData(parsedData);
        } else {
          setParsingError(
            "CSV should contain a header and at least one data row."
          );
          setCsvData(null);
        }
      } catch (parseErr) {
        setParsingError("Error parsing CSV file." + parseErr.message);
        setCsvData(null);
      }
    };

    reader.onerror = () => {
      setParsingError("Failed to read CSV file.");
      setSelectedFile(null);
      setCsvData(null);
    };

    reader.readAsText(file);
  } else {
    setSelectedFile(null);
    setCsvData(null);
    setParsingError(null);
  }
};

export const handleDownloadSample = () => {
  const sampleData = [
    ['username', 'password', 'url'],
    ['john.doe@example.com', 'password123', 'https://example.com'],
    ['jane.smith@company.com', 'securepass456', 'https://company.com']
  ];
  const csvContent = sampleData.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'sample_credentials.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}; 
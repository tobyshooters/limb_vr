function convertArrayOfObjectsToCSV(data) {
  let columnDelimiter = ',';
  let lineDelimiter = '\n';
  let keys = Object.keys(data[0]);

  let result = '';
  result += keys.join(columnDelimiter);
  result += lineDelimiter;

  data.forEach(function(item) {
    let ctr = 0;
    keys.forEach(function(key) {
      if (ctr > 0) result += columnDelimiter;
      result += item[key];
      ctr++;
    });
    result += lineDelimiter;
  });

  return result;
}

function downloadCSV(data) {
  let csv = convertArrayOfObjectsToCSV(data);
  let filename = 'export.csv';

  if (!csv.match(/^data:text\/csv/i))
    csv = 'data:text/csv;charset=utf-8,' + csv;

  let filedata = encodeURI(csv);
  console.log(filedata);
}

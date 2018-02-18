function flattenObject(ob) {
  var toReturn = {};
  for (var i in ob) {
    if (!ob.hasOwnProperty(i)) continue;

    if ((typeof ob[i]) == 'object') {
      var flatObject = flattenObject(ob[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;
        toReturn[i + '.' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
};

function convertArrayOfObjectsToCSV(data) {
  let columnDelimiter = ',';
  let lineDelimiter = '\n';
  let keys = Object.keys(flattenObject(data[0]));

  let result = '';
  result += keys.join(columnDelimiter);
  result += lineDelimiter;

  data.forEach(function(item) {
    item = flattenObject(item);
    let ctr = 0;
    keys.forEach(function(key) {
      if (ctr > 0) result += columnDelimiter;
      result += JSON.stringify(item[key]);
      ctr++;
    });
    result += lineDelimiter;
  });

  return result;
}

function downloadCSV(data) {
  let csv = convertArrayOfObjectsToCSV(data);
  let filename = 'export.csv';

  // if (!csv.match(/^data:text\/csv/i))
  //   csv = 'data:text/csv;charset=utf-8,' + csv;

  let blob = new Blob([csv]);
  let a = window.document.createElement("a");
  a.href = window.URL.createObjectURL(blob, {type: "text/plain"});
  a.download = "timeSeriesData.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

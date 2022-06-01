var fs = require("fs");


function toFile(array, path) {
  const file = fs.createWriteStream(path);
  
  array.forEach(function (v) {
    file.write(v + "\n");
  });

  file.end();
}
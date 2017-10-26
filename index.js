var fs = require('fs');
var http = require('http');
var formidable = require('formidable');
var xlsx = require('node-xlsx');
var shopifyAPI = require('shopify-node-api');

var request = require('request').defaults({ encoding: null });

var Shopify = new shopifyAPI({
  shop: process.env.SHOP, // MYSHOP.myshopify.com  // process.env.shop
  apiKey: process.env.API_KEY, // Your API key 
  access_token: process.env.PASSWORD, // Your API password 
  verbose: false
});

function callback(err, data, headers) {
  var api_limit = headers['http_x_shopify_shop_api_call_limit'];
  console.log( api_limit ); // "1/40" 
}

// var query_data = '';

// Shopify.get('/admin/products.json', query_data, function(err, data, headers){
//   console.log(data); // Data contains product json information 
//   console.log(headers); // Headers returned from request 
// });

console.log(process.env.SHOP);
console.log(process.env.API_KEY);
console.log(process.env.PASSWORD);
console.log(process.env.ACCESS_TOKEN);

// console.log(Shopify.hostname());

http.createServer(function (req, res) {
  if (req.url == '/fileupload') {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.path;
      // var newpath = 'C:/Users/Your Name/' + files.filetoupload.name;
      // fs.rename(oldpath, newpath, function (err) {
      //   if (err) throw err;
      //   res.write('File uploaded and moved!');
      //   res.end();
      // });

   	  //   fs.createReadStream(files.filetoupload.path)
	  // .pipe(csv())
	  // .on('data', function (data) {
	  //   console.log(data);
	  // })

     const workSheetsFromFile = xlsx.parse(files.filetoupload.path);

     // console.log(workSheetsFromFile[0].data[1]);


     var artist = workSheetsFromFile[0].data[1];

     console.log(artist[3]);
     console.log(artist[9]);
     
     request.get(artist[9], function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	        attachment = "" + new Buffer(body).toString('base64');
	        // console.log(attachment);

	         var post_data = {
			  "product": {
			    "title": artist[3],
			    "body_html": artist[8],
			    "vendor": "",
			    "product_type": "",
			    "published_scope": "global",
			    "images": [
			      {
			        "attachment": attachment
			      }
			    ],
			    "tags": artist[7].split(/\r?\n/).join(','),
			    "variants": [
			    ]
			  }
			}
			
			console.log(post_data); 

			Shopify.post('/admin/products.json', post_data, function(err, data, headers){
			  console.log(err);
			  console.log(data);
			//  console.log(headers);
			});

	    }
	});

    


 });
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
    res.write('<input type="file" name="filetoupload"><br>');
    res.write('<input type="submit">');
    res.write('</form>');
    return res.end();
  }
}).listen(8080); 
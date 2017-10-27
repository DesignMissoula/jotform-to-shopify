var fs = require('fs');
var http = require('http');
var formidable = require('formidable');
var xlsx = require('node-xlsx');
var shopifyAPI = require('shopify-node-api');

var request = require('request').defaults({ encoding: null });

var trim = require('trim');
var slug = require('slug');

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
  	res.writeHead(200, {'Content-Type': 'text/html'});
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

     workSheetsFromFile[0].data.shift();

     // var test = [];

     // test.push(workSheetsFromFile[0].data.pop());
     // test.push(workSheetsFromFile[0].data.pop());
     // test.push(workSheetsFromFile[0].data.pop());
     // test.push(workSheetsFromFile[0].data.pop());
     // test.push(workSheetsFromFile[0].data.pop());
     // test.push(workSheetsFromFile[0].data.pop());
     // test.push(workSheetsFromFile[0].data.pop());
     // test.push(workSheetsFromFile[0].data.pop());
     // test.push(workSheetsFromFile[0].data.pop());
     // test.push(workSheetsFromFile[0].data.pop());

     
    // console.log(test);
		workSheetsFromFile[0].data.forEach(function(currentValue, currentIndex, listObj){
		// test.forEach(function(currentValue, currentIndex, listObj){

		// console.log(slug(listObj[currentIndex][3]).toLowerCase());
		// res.write( '<li>' + slug(listObj[currentIndex][3].toLowerCase()) + '</li>');

		var handle = '';

		if( listObj[currentIndex][3] ){
			handle = slug(listObj[currentIndex][3].toLowerCase());
		}

		var title = '';
		if( listObj[currentIndex][3] ){
			title = trim(listObj[currentIndex][3]);
		}


		var instagramURL = '';
		var facebookURL = '';
		var websiteURL = '';


		if( listObj[currentIndex][6] && trim(listObj[currentIndex][6]) != '' ){
			// console.log(instagram(listObj[currentIndex][6]));
			// res.write( '<li>' + instagram(listObj[currentIndex][6]) + '</li>');
			instagramURL = instagram(listObj[currentIndex][6]);
		}else{
			// console.log('N/A');
			// res.write('<li>N/A</li>');
		}

		if( listObj[currentIndex][5] && trim(listObj[currentIndex][5]) != '' ){
			// console.log(facebook(listObj[currentIndex][5]));
			// res.write( '<li>' + facebook(listObj[currentIndex][5]) + '</li>');
			facebookURL = facebook(listObj[currentIndex][5]);
		}else{
			// console.log('N/A');
			// res.write('<li>N/A</li>');
		}

		if( listObj[currentIndex][4] && trim(listObj[currentIndex][4]) != '' ){
			// console.log(website(listObj[currentIndex][4]));
			// res.write( '<li>' + facebook(listObj[currentIndex][5]) + '</li>');
			websiteURL = website(listObj[currentIndex][4]);
		}else{
			// console.log('N/A');
			// res.write('<li>N/A</li>');
		}

		var body_html = '';
		body_html = (listObj[currentIndex][8])? '<p class="p1">'+listObj[currentIndex][8].replace('\r\n','</p><p>').replace('\r\n','</p><p>').replace('\r\n','</p><p>').replace('\r\n','</p><p>').replace('\r\n','</p><p>')+'</p>':'' ;
		body_html = body_html + ' <p class="p1">';
		body_html = body_html + ((body_html)? ' ':'' ) + ((websiteURL != '')?''+createURL(websiteURL, 'WEBSITE'):'' );

		body_html = body_html + ((websiteURL != '' && ( facebookURL != '' || instagramURL != '' ) )? ' // ':'');

		body_html = body_html + ((facebookURL != '')?''+createURL(facebookURL, 'FACEBOOK'):'' );

		body_html = body_html + ((facebookURL != '' && instagramURL != '' )? ' // ':'');

		body_html = body_html + ((instagramURL != '')?''+createURL(instagramURL, 'INSTAGRAM'):'' );
		body_html = body_html + ' </p>';

		body_html = trim(body_html);

		// console.log(body_html);

		// console.log(facebookURL); 
		var tags = [];

		if( listObj[currentIndex][7] ){
			tags = tags.concat( listObj[currentIndex][7].split(/\r?\n/) );
		}

		if( listObj[currentIndex][0].includes("BOTH") ){
			tags.push('Missoula Holiday MADE fair');
			tags.push('Helena Holiday MADE fair');
		}else if( listObj[currentIndex][0].includes("Missoula") ){
			tags.push('Missoula Holiday MADE fair');
		}else if( listObj[currentIndex][0].includes("Helena") ){
			tags.push('Helena Holiday MADE fair');
		}
		

		tags = tags.join(',');
		
		// wait(500);
		// console.log('waiting...');

		request.get(listObj[currentIndex][9], function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	        attachment = "" + new Buffer(body).toString('base64');
	        // console.log(attachment);

	         var post_data = {
			  "product": {
			  	"handle": handle,
			    "title": title,
			    "body_html": body_html,
			    "vendor": "",
			    "product_type": "artist",
			    "published_scope": "global",
			    "images": [
			      {
			        "attachment": attachment
			      }
			    ],
			    "tags": tags,
			    "variants": [
			    ]
			  }
			}
			
			// console.log(post_data); 

			Shopify.post('/admin/products.json', post_data, function(err, data, headers){
			  console.log(err);
			  console.log(data);
			  console.log(headers);
			  if(data){
			  	res.write(JSON.stringify(data));
			  }else if(err){
			  	res.write(JSON.stringify(err));
			  }
			  
			});

	    }else{
	    	console.log(listObj[currentIndex][9]);
	    	console.log('Request error: '+error);
	    }

	});

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


function instagram(url){
	var baseUrl = 'https://www.instagram.com/';

	username = url.toLowerCase().split("?")[0];
	username = username.replace('www.instagram.com','');
	username = username.replace('instagram.com','');
	username = username.replace('https://www.','');
	username = username.replace('http://www.','');
	username = username.replace('https:','');
	username = username.replace('http:','');
	username = username.replace('/','').replace('/','').replace('/','').replace('/','').replace('/','');
	username = username.replace('@','');
	username = username.replace("'",'').replace("'",'');
	username = username.replace(' ','').replace(' ','');

	username = trim(username);

	return baseUrl+username;
}

function facebook(url){
	var baseUrl = 'https://www.facebook.com/';

	username = url.toLowerCase().split("?")[0];
	username = username.replace('www.facebook.com','');
	username = username.replace('facebook.com','');
	username = username.replace('https://www.','');
	username = username.replace('http://www.','');
	username = username.replace('https:','');
	username = username.replace('http:','');
	username = username.replace('/','').replace('/','').replace('/','').replace('/','').replace('/','');
	username = username.replace('@','');
	username = username.replace("'",'').replace("'",'');
	username = username.replace(' ','').replace(' ','');

	username = trim(username);

	return baseUrl+username;
}

function website(url){
	var baseUrl = '';


	url = trim(url);

	url = url.replace(' ','').replace(' ','').replace(' ','').replace(' ','').replace(' ','').replace(' ','').replace(' ','');

	if (!/^(f|ht)tps?:\/\//i.test(url)) {
      url = "http://" + url;
    }

	return url;
}


function createURL(url, string){
	return '<a href="'+url+'" target="_BLANK">'+string+'</a>';
}


function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}
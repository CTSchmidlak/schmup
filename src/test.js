//test
console.log("whats up TS?");
console.log("hows it going");
console.log("Cooper".length);
000000

//function practice
var num = 30;

var div3 = function (x)
{
	var value = x/3;
	console.log(value);
};

var div6 = function(x)
{
	var value = x/6;
	console.log(value);
};

div3(num);
div6(num);

//for loop practice
console.log("now a for loop...");
for (x = 1; x < 6; x+=3)
{
	console.log(x);
}

//array practice
var array = ["fee","fi","fo","fum"]
var arr2 = "Heteroskedasticity";

console.log(array);
console.log(arr2[6]);

if (num>29)
{
	array.push("englishman");
	console.log(array);
}

//testing 'not' operator.

var name ="Bill Bob";

if (!name){
	console.log("John Smith");
} else {
	console.log(name);
}
function doSomething(some)
{
     doSomething.counter++;
console.log(some);
}
doSomething.counter=0;
doSomething(5);
doSomething(10);
console.log(doSomething.counter);
//console.log(doSomething.length);
//console.log(doSomething.name);



// Memoization
function square(num) {
    square.cache = square.cache || {};

    if (square.cache[num]) {
        return square.cache[num];
    }

    const ans = num * num;
    square.cache[num] = ans;

    return ans;
}

//console.log(square(4)); 
//console.log(square(2)); 
//console.log(square(4)); 



function saySomething()
{

console.log('Welcome to CDV');
saySomething=function(){

    console.log('Hi there')

}

}
saySomething();
saySomething();
saySomething();

//////////////////
//Immiediately invoked functions

(function(){
let aa=5;
console.log(aa);

})();

//Recursion

function showNumbers(nums)
{
console.log(num);
 if(num>0) showNumbers(num-1);
}
showNumbers(5);


//
function userSpeaking (user,message)
{
return `${user} says: ${message}`;

}
console.log(userSpeaking('John','Hello'));
console.log(userSpeaking('John','How are you?'));
console.log(userSpeaking('John','Ok'));

function userSpeakingImp(user){
    function gotMessage(message){
        return `${user} says: ${message}`;
    }
    return gotMessage;
}
const johnSpeaks=userSpeakingImp('john');
console.log(johnSpeaks('Hello'));
console.log(johnSpeaks('How are you?'));
console.log(johnSpeaks('Ok?'));

function someWhereElse(userSpeaking)
{
console.log(userSpeaking('Are you understanding?'));

}
someWhereElse(johnSpeaks);



    const userSpeakingImp=(user)=> (message) =>  `${user} says: ${message}`;
    

const johnSpeaks=userSpeakingImp('john');
console.log(johnSpeaks('Hello'));
console.log(johnSpeaks('How are you?'));
console.log(johnSpeaks('Ok?'));

 console.log(userSpeakingImp('Peter')('Hello'));
 /////////////////////////////////////////////////////////////////////////


 function restrict(num)
 {
if (num<0) return 0;
else if (num>10) return 10;
return num ;
 }
 console.log(restrict(7));
console.log(restrict(12));
console.log(restrict(-6));

function calculate(aa,bb,oper)
{
return operator(restrict(aa),restrict(bb));

}
const addition=(aa,bb)=>aa+bb;
const addition=(aa,bb)=>aa*bb;
console.log(calculate(4,15,'addition'));
console.log(calculate(4,5,'multiply'));

//timers
setTimeout(()=>{
    console.log('Time is over!');

},2000);

const interval=setInterval( ()=>{
console.log(`Message ${count} `);
count++;

},2000);

setTimeout (()=>{
    console.log('Stop interval');
    clearInterval('interval');
},10000);


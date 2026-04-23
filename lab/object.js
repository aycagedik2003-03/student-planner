const emptyObj={};
const employer={
    name: 'John',
    surname: 'Smith',
    address:{
        street:'Kutrzeby'
        city: 'Poznan'
    },
    sayHello(){
        console.log("Hello John");

    }

};

console.log(employer);
console.log(employer.surname);
console.log(employer['name']);
console.log(employer.address.city);
employer.address.streets='taczaka';
employer.telephone=1234556;
delete employer.surname;
console.log(employer);
employer.sayHello.();
 

const posX=20;
const posY=30;
const car1Pos= {posX:posX,posY:posY};
const car2Pos={posX,posY};
console.log(car1pos);
console.log(car2pos);
const submarine= {posX,posY,posZ:-50};
const submarine2= {...car2Pos,posZ:-50};
console.log(submarine2);
if ('posZ' in submarine2)
{
    console.log(`posZ exists in ${submarine2.posZ}`);

}

for (consts key in submarine2)
{
    console.log(`Key: ${key} Value: ${submarine2[key]}`);

}

let aa = 5;
let bb = aa;
aa = 10;
console.log(aa);
console.log(bb);

const aaObj = {num:5};
let bbObj = aaObj;
aaObj.num=10;
console.log(aaObj);
console.log(bbObj);




//objects as parameters
function showBasket1 (name,qty,price,discount,voucher) {
    console.log(`${name} ${qty} ${price} ${discount} ${voucher}`) ;

}



function showBasket2 (name,qty,price,discount,voucher) {
    console.log(`${name} ${qty} ${price} ${discount} ${voucher}`) ;

}

const item={
    name:'cookies',\
    qty:5,
    price:10,
    discount:2,
    voucher:10
}
showBasket2({discount:2, name:'cookies',  voucher:10, qty:5,price:10});


//JSON
console.log(item);
const info=JSON.stringly(item);
console.log(info);
const infoObj=JSON.parse(info);
console.log(infoObj);

//this in object
let myCountry= 'Turkey';
const person={
    myName:'Ayca',
    surname:'Gedik',
    country:'Poland',
    display(){
        console.log(`${this.myName} ${this.surname}`);

    },
    show:function() {
        console.log(`${this.myName} ${this.surname}`);
    }
    //in onjects we never use arrow funtions
    writeInfo:()=>{
        console.log(`${this.name} ${this.surname}`)
    }
}
person.display();
person.show();
person.writeInfo();
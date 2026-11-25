// Запуск: node test.cjs. Перевірка логіки, а не візуального вигляду браузера.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Lab5 = require('./validation.js');

assert.equal(Lab5.variantFor(15), 9);
assert.equal(Lab5.variantFor(36), 21);
assert.equal(Lab5.variantFor(10), 9);
assert.deepEqual(Lab5.alternatingColumnCells(21), [21, 33]);
assert.deepEqual(Lab5.alternatingColumnCells(36), [36]);
const valid = {fullName:'Рябокінь Д.О.',variant:'09',group:'ІС-41',faculty:'ФІОТ',birthDate:'26.10.2006'};
assert.deepEqual(Lab5.validate(valid), {});
for (const [key, values] of Object.entries({
    fullName:['', 'Рябокінь Дмитро', 'Рябокінь Д.О.<script>', 'Рябокінь д.о.'],
    variant:['129', '9', 'ab', '-1'], group:['IS-41', 'ІС41', 'ІС-411'],
    faculty:['ФІ', 'ФІОТ1', '1234'], birthDate:['31.02.2006', '31.04.2006', '29.02.1900', '00.01.2006', '26/10/2006']
})) {
    for (const value of values) assert(Lab5.validate({...valid,[key]:value})[key], `${key} must reject ${value}`);
}
assert.equal(Object.keys(Lab5.validate({})).length,5);
for (const date of ['29.02.2000','29.02.2024','31.12.2006']) assert(Lab5.isCalendarDate(date));
assert.equal(Lab5.isCalendarDate('01.01.0000'),false);
assert.equal(Lab5.textColor('#000000'),'#ffffff');
assert.equal(Lab5.textColor('#ffffff'),'#000000');

class Element {
    constructor() {
        this.events={}; this.style={}; this.dataset={}; this.classes=new Set(); this.children=[];
        this.value=''; this.textContent=''; this.attrs={};
        this.classList={toggle:(name,on)=>on?this.classes.add(name):this.classes.delete(name)};
    }
    addEventListener(name,fn) {this.events[name]=fn;}
    setAttribute(name,value) {this.attrs[name]=value;}
    closest() {return this.row;}
    focus() {this.focused=true;}
    append(...children) {this.children.push(...children);}
    replaceChildren(...children) {this.children=[...children];}
}
const ids={};
for (const id of ['student-form','form-status','color-grid','palette','table-status','reset-colors']) ids[id]=new Element();
const inputs={};
for (const key of Object.keys(valid)) {
    inputs[key]=new Element(); inputs[key].row=new Element(); inputs[key].value=valid[key];
    ids[`${key}-error`]=new Element();
}
ids['student-form'].elements={namedItem:key=>inputs[key]};
for(let n=1;n<=36;n++) ids[`cell-${n}`]=new Element();
ids['color-grid'].querySelectorAll=()=>Array.from({length:36},(_,i)=>ids[`cell-${i+1}`]);
ids.palette.value='#71c4e8';
let opens=0,blocked=false;
const resultDoc={documentElement:{},head:new Element(),body:new Element(),createElement:()=>new Element()};
const window={open:()=>{opens++;return blocked?null:{document:resultDoc,focus(){}};}};
const document={getElementById:id=>ids[id]};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'script.js'),'utf8'),{Lab5,window,document,Math});
const submit=()=>ids['student-form'].events.submit({preventDefault(){}});
inputs.faculty.value=''; submit();
assert.equal(opens,0); assert(inputs.faculty.row.classes.has('invalid')); assert(inputs.faculty.focused);
inputs.faculty.value='ФІОТ'; inputs.faculty.events.input(); assert(!inputs.faculty.row.classes.has('invalid'));
submit(); assert.equal(opens,1);
assert.equal(resultDoc.body.children[1].children.length,10);
assert.equal(resultDoc.body.children[1].children[1].textContent,'Рябокінь Д.О.');
submit(); assert.equal(resultDoc.body.children.length,2); // повторне відправлення не дублює результат
blocked=true; submit(); assert(ids['form-status'].textContent.includes('заблокував'));
inputs.birthDate.value='31.02.2006'; submit(); assert(inputs.birthDate.row.classes.has('invalid'));
ids['student-form'].events.reset(); assert(!inputs.birthDate.row.classes.has('invalid'));

const active=ids['cell-21'];
active.events.mouseenter(); assert(/^#[0-9a-f]{6}$/.test(active.style.backgroundColor));
active.events.click(); assert.equal(active.style.backgroundColor,'#71c4e8');
ids.palette.value='#102030'; active.events.dblclick();
assert.equal(ids['cell-21'].style.backgroundColor,'#102030');
assert.equal(ids['cell-33'].style.backgroundColor,'#102030');
for(let n=1;n<=36;n++) if(n!==21&&n!==33) assert.equal(ids[`cell-${n}`].style.backgroundColor,undefined);
ids['reset-colors'].events.click();
for(let n=1;n<=36;n++) assert.equal(ids[`cell-${n}`].style.backgroundColor,'');
ids.palette.value='#ffffff'; active.events.keydown({key:'Enter',shiftKey:true,preventDefault(){}});
assert.equal(ids['cell-33'].style.color,'#000000');
console.log('PASS: formulas, regex validation, real calendar dates, form errors, separate result window, popup blocking, repeated submit, table hover/click/dblclick, target cells 21/33, reset and keyboard.');
console.log('Scope: pure functions and event handlers using a DOM mock; browser appearance is not tested.');

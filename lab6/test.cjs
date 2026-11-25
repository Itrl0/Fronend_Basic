const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const api = require('./api.js');
const sample = {results:[{picture:{large:'https://randomuser.me/api/portraits/men/1.jpg'},location:{city:'Kyiv',postcode:0},cell:'123',name:{first:'Test',last:'User'}}]};

class Element {
    constructor() {this.children=[];this.events={};this.attrs={};this.classes=new Set();this.classList={add:x=>this.classes.add(x),remove:x=>this.classes.delete(x)};}
    append(...items) {items.forEach(x=>x.parent=this);this.children.push(...items);}
    replaceChildren(...items) {this.children=[];this.append(...items);}
    addEventListener(event,fn) {this.events[event]=fn;}
    setAttribute(key,value) {this.attrs[key]=value;}
    remove() {this.parent.children=this.parent.children.filter(x=>x!==this);}
}

(async () => {
    assert.equal((129-1)%20+1,9);
    assert.equal(api.parseUsers(sample)[0].postcode,'0');
    assert.equal(api.parseUsers({results:[{location:{postcode:'AB1 2CD'}}]})[0].postcode,'AB1 2CD');
    assert.equal(api.parseUsers({results:[{}]})[0].name,'Немає даних');
    assert.equal(api.parseUsers({results:[{picture:{large:'javascript:alert(1)'}}]})[0].picture,'');
    for(const bad of [{},{results:[]},{error:'offline'},{results:[null]}]) assert.throws(()=>api.parseUsers(bad));
    assert.equal((await api.loadUsers(async()=>({ok:true,json:async()=>sample})))[0].name,'Test User');
    await assert.rejects(api.loadUsers(async()=>({ok:false,status:503})),/HTTP 503/);
    await assert.rejects(api.loadUsers(async()=>({ok:true,json:async()=>{throw new SyntaxError();}})),/JSON/);
    await assert.rejects(api.loadUsers(async()=>{throw new TypeError();}),/інтернет/);
    await assert.rejects(api.loadUsers((url,opts)=>new Promise((resolve,reject)=>opts.signal.addEventListener('abort',()=>reject(Object.assign(new Error(),{name:'AbortError'})))),5),/час/);

    const ids=Object.fromEntries(['load-users','users','status'].map(id=>[id,new Element()]));
    let pending,requests=0;
    const Lab6={loadUsers:()=>{requests++;return new Promise((resolve,reject)=>pending={resolve,reject});}};
    const document={getElementById:id=>ids[id],createElement:()=>new Element()};
    vm.runInNewContext(fs.readFileSync(path.join(__dirname,'script.js'),'utf8'),{document,Lab6});
    const flush=()=>new Promise(resolve=>setImmediate(resolve));
    const click=ids['load-users'].events.click;
    click();click();assert.equal(requests,1);assert(ids['load-users'].disabled);
    pending.resolve(api.parseUsers(sample));await flush();
    assert.equal(ids.users.children.length,1);assert.equal(ids['load-users'].disabled,false);
    const card=ids.users.children[0];const image=card.children[1];const fallback=card.children[2];
    image.events.error();assert.equal(fallback.hidden,false);
    click();pending.resolve(api.parseUsers(sample));await flush();assert.equal(ids.users.children.length,1);
    click();pending.reject(new Error('offline'));await flush();
    assert.equal(ids.users.children.length,1);assert(ids.status.textContent.includes('Попередні'));
    assert.equal(ids['load-users'].disabled,false);assert.equal(ids.users.attrs['aria-busy'],'false');
    console.log('PASS: variant, fields, numeric/string postcode, missing data, HTTP/network/JSON/API failures, timeout, loading lock, replacement, image fallback, preserved cards and retry. DOM mock only.');
})().catch(error=>{console.error(error);process.exitCode=1;});

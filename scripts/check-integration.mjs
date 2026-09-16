import http from 'node:http';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from '@playwright/test';

// This fixture never sends mail, charges a card, or creates a real booking.
const departure={id:'11111111-1111-4111-8111-111111111111',start_date:'2030-10-10',end_date:'2030-10-25',price_usd:'2345.00',available_seats:6,status:'GUARANTEED'};
const trip={id:'22222222-2222-4222-8222-222222222222',slug:'contract-everest',title:'Everest Base Camp',destination_name:'Everest & Khumbu',destination_slug:'everest',category_name:'Treks',category_slug:'treks',duration_days:16,starting_price_usd:'2345.00',altitude_max_meters:5545,difficulty_grade:'GRADE_4'};
const detail={...trip,destination:{name:trip.destination_name,slug:'everest'},category:{name:'Treks',slug:'treks'},overview:'Follow the Khumbu valley into the high Himalaya.\nA route shaped by village life and the mountain landscape.',min_group_size:1,max_group_size:14,best_seasons:['Spring','Autumn'],inclusions:['Accommodation','Guide services'],exclusions:['International flights'],packing_list:['Warm layers'],itinerary_days:[{day_number:1,title:'Arrive in Kathmandu',description:'Meet your team and discuss the journey.',overnight_stay:'Kathmandu',elevation_meters:1400,is_acclimatization_day:false}],departures:[departure]};
let mode='ok',lastInquiry,lastBooking,bookingsCreated=0;
const receipt={booking_reference:'TEST-BOOKING-0001',trip_title:trip.title,trip_start_date:departure.start_date,num_travelers:1,currency:'USD',total_amount_usd:'2345.00',deposit_amount_usd:'469.00',amount_paid_usd:'0.00',status:'PENDING'};
const fixture=http.createServer(async(req,res)=>{
 let raw='';for await(const chunk of req)raw+=chunk;
 const input=raw?JSON.parse(raw):{},url=new URL(req.url,'http://fixture');
 const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(status<400?{success:true,data,message:'OK'}:{success:false,error:{message:data,details:{email:['Check your details.']}}}));};
 if(url.pathname==='/api/v1/trips/'){
  if(mode==='outage')return send(503,'Unavailable');
  if(mode==='malformed'){res.writeHead(200,{'Content-Type':'application/json'});return res.end('{"success":true,"data":{"unexpected":true}}');}
  const second=url.searchParams.get('page')==='2';
  return send(200,{count:2,next:second?null:'http://untrusted.example/api/v1/trips/?page=2',results:second?[{...trip,slug:'contract-mustang',title:'Upper Mustang',destination_name:'Mustang',destination_slug:'mustang',altitude_max_meters:null}]:[trip]});
 }
 if(url.pathname===`/api/v1/trips/${trip.slug}/`)return send(200,{...detail,departures:[{...departure,status:mode==='sold-out'?'SOLD_OUT':'GUARANTEED'}]});
 if(url.pathname===`/api/v1/trips/${trip.slug}/departures/`)return send(200,{results:[{...departure,status:mode==='sold-out'?'SOLD_OUT':'GUARANTEED'}],next:null});
 if(url.pathname==='/api/v1/inquiries/'){lastInquiry=input;if(mode==='inquiry-fail')return send(400,'Please check your inquiry.');return send(201,{inquiry_number:'TEST-INQUIRY-001'});}
 if(url.pathname==='/api/v1/auth/login/'||url.pathname==='/api/v1/auth/register/'){if(input.password!=='correct-test-password')return send(401,'Invalid email or password.');return send(200,{access:'fixture-access-token',refresh:'fixture-refresh-token',user:{first_name:'Test'}});}
 if(url.pathname==='/api/v1/auth/password/reset/'||url.pathname==='/api/v1/auth/password/reset/confirm/')return send(200,{});
 if(url.pathname==='/api/v1/users/me/')return req.headers.authorization==='Bearer fixture-access-token'?send(200,{first_name:'Test'}):send(401,'Please sign in.');
 if(url.pathname==='/api/v1/bookings/'&&req.method==='POST'){lastBooking=input;bookingsCreated++;return send(201,receipt);}
 if(url.pathname==='/api/v1/bookings/')return req.headers.authorization==='Bearer fixture-access-token'?send(200,{results:[receipt],next:null,previous:null}):send(401,'Please sign in.');
 send(404,'Not found');
});
fixture.listen(0,'127.0.0.1');await once(fixture,'listening');
const port=3011,base=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{cwd:process.cwd(),env:{...process.env,BACKEND_API_URL:`http://127.0.0.1:${fixture.address().port}/api/v1`},windowsHide:true,stdio:['ignore','pipe','pipe']});
let logs='';child.stdout.on('data',x=>logs+=x);child.stderr.on('data',x=>logs+=x);
let browser;
try {
 for(let i=0;i<80;i++){try{if((await fetch(base+'/api/trips')).ok)break;}catch{}if(i===79)throw new Error(logs);await new Promise(r=>setTimeout(r,250));}
 const call=(path,input,extra={})=>fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:base,...extra},body:JSON.stringify(input)});
 let r=await fetch(base+'/api/trips'),body=await r.json();assert.equal(body.trips.length,2);assert.equal(body.demo,false);assert.equal(body.trips[1].altitude_max_meters,null);
 mode='outage';assert.equal((await fetch(base+'/api/trips')).status,503);
 mode='malformed';assert.equal((await fetch(base+'/api/trips')).status,502);mode='ok';
 r=await call('/api/auth/login',{email:'test@example.com',password:'wrong'});assert.equal(r.status,401);assert.equal(r.headers.get('set-cookie'),null);
 r=await call('/api/auth/login',{email:'test@example.com',password:'correct-test-password'});assert.equal(r.status,200);assert.match(r.headers.get('set-cookie'),/HttpOnly/i);const cookie=r.headers.get('set-cookie').split(';')[0];assert.equal((await r.json()).access,undefined);
 r=await fetch(base+'/api/account',{headers:{Cookie:cookie}});assert.equal(r.status,200);assert.equal((await r.json()).bookings[0].booking_reference,receipt.booking_reference);
 assert.equal((await fetch(base+'/api/account')).status,401);
 assert.equal((await call('/api/inquiries',{full_name:'Test',email:'test@example.com',message:'Local fixture test'},{Origin:'https://other.example'})).status,403);
 mode='inquiry-fail';assert.equal((await call('/api/inquiries',{full_name:'Test',email:'test@example.com',message:'Local fixture test'})).status,400);mode='ok';
 r=await call('/api/inquiries',{full_name:'Test',email:'test@example.com',message:'Local fixture test',trip:trip.id,group_size:'2',preferred_dates:'October 2030'});assert.equal(r.status,201);assert.equal((await r.json()).reference,'TEST-INQUIRY-001');assert.equal(lastInquiry.inquiry_type,'JOURNEY');assert.equal(lastInquiry.group_size,2);
 const passenger={full_name:'Test Traveller',date_of_birth:'1990-01-01',nationality:'Test',passport_number:'TEST-ONLY',passport_expiry_date:'2033-01-01',insurance_provider:'Fixture',insurance_policy_number:'TEST-POLICY',insurance_emergency_phone:'000000',emergency_contact_name:'Test Contact',emergency_contact_phone:'000001'};
 const input={trek_slug:trip.slug,departure_id:departure.id,customer_name:'Test Traveller',customer_email:'test@example.com',payment_type:'DEPOSIT_20',passengers:[passenger],total_amount_usd:'1'};
 mode='sold-out';assert.equal((await call('/api/bookings',input)).status,409);assert.equal(bookingsCreated,0);mode='ok';
 r=await call('/api/bookings',{...input,passengers:[{...passenger,passport_expiry_date:'2030-11-01'}]});assert.equal(r.status,400);assert.equal(bookingsCreated,0);
 r=await call('/api/bookings',input);assert.equal(r.status,201);body=await r.json();assert.equal(body.receipt.total_amount_usd,'2345.00');assert.equal(body.receipt.passengers,undefined);assert.equal(lastBooking.total_amount_usd,undefined);assert.equal(bookingsCreated,1);
 browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/treks');await page.locator('.trip-card').first().waitFor();assert.equal(await page.locator('.trip-card').count(),2);await page.getByRole('searchbox',{name:'Search treks'}).fill('Everest');assert.equal(await page.locator('.trip-card').count(),1);await page.locator('.trip-card').click();await page.getByRole('heading',{name:'The path ahead.'}).waitFor();await page.locator('.itinerary-list summary').click();await page.getByText('Meet your team and discuss the journey.').waitFor();
 await page.getByRole('link',{name:'Choose date'}).click();await page.getByRole('heading',{name:'Your group'}).waitFor();await page.getByLabel('Contact name',{exact:true}).fill('Test Traveller');await page.getByLabel('Contact email',{exact:true}).fill('test@example.com');for(const [key,value] of Object.entries(passenger))await page.locator(`[name="traveller_0_${key}"]`).fill(value);await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Submit booking request'}).click();await page.getByText('TEST-BOOKING-0001',{exact:true}).waitFor();assert.equal(bookingsCreated,2);
 await page.goto(base+'/login');await page.getByLabel('Email address').fill('test@example.com');await page.getByLabel('Password',{exact:true}).fill('wrong');await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.getByRole('alert').waitFor();assert.match(page.url(),/login/);await page.getByLabel('Password',{exact:true}).fill('correct-test-password');await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.waitForURL('**/account');await page.getByText('TEST-BOOKING-0001',{exact:true}).waitFor();await page.getByRole('button',{name:'Sign out'}).click();await page.getByText('You are signed out.').waitFor();
 await page.goto(base+'/contact');await page.getByLabel('Your name',{exact:true}).fill('Test Traveller');await page.getByLabel('Email address',{exact:true}).fill('test@example.com');await page.getByLabel('Your journey',{exact:true}).fill('Local fixture inquiry');await page.getByRole('button',{name:'Send Inquiry'}).click();await page.getByText('Your inquiry is with the team.').waitFor();
 await mkdir('test-results',{recursive:true});
 for(const width of [390,768,1440]){await page.setViewportSize({width,height:950});for(const path of ['/treks','/treks/contract-everest','/contact','/login','/booking?trek=contract-everest&departure='+departure.id]){await page.goto(base+path);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${path} overflow at ${width}`);} }
 await page.goto(base+'/treks/contract-everest');await page.screenshot({path:'test-results/trek-live-desktop.png',fullPage:true});assert.deepEqual(errors,[]);
 console.log('PASS: Django envelopes, pagination, outages, auth cookies, rejected credentials, inquiry errors/references, booking prices, seat/passport validation, end-to-end forms and responsive layouts. All submissions used a local fixture.');
} finally {await browser?.close();child.kill();fixture.closeAllConnections();fixture.close();}

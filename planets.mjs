/** Solar-system facts are paraphrased from NASA Solar System Exploration (see README). */
export const SOLAR_BODIES = Object.freeze([
  { id:'sun', name:'The Sun', kind:'STAR', radius:0, period:0, size:26, color:'#ffcf7a', glow:'#ed883e', accent:'#ffd18b', background:'#170f1b', phase:0,
    description:'The Sun is the star at the center of our solar system. Its gravity holds the planets in orbit and its energy powers life on Earth.',
    fact:'The Sun contains more than 99% of the total mass of the solar system.' },
  { id:'mercury', name:'Mercury', kind:'TERRESTRIAL PLANET', radius:39, period:0.9, size:6, color:'#b6bbc5', glow:'#8996af', accent:'#dce2ed', background:'#101523', phase:2.7,
    description:'The smallest planet, Mercury is a rocky world closest to the Sun, with a heavily cratered surface.',
    fact:'One orbit around the Sun takes Mercury just 88 Earth days.' },
  { id:'venus', name:'Venus', kind:'TERRESTRIAL PLANET', radius:61, period:1.4, size:9, color:'#e6b987', glow:'#b58858', accent:'#f6d4a7', background:'#19151e', phase:4.1,
    description:'Venus is a rocky planet surrounded by a thick carbon-dioxide atmosphere and clouds of sulfuric acid.',
    fact:'Venus is hotter at its surface than Mercury, even though Mercury is closer to the Sun.' },
  { id:'earth', name:'Earth', kind:'TERRESTRIAL PLANET', radius:83, period:2.0, size:10, color:'#68c6f4', glow:'#2484ca', accent:'#8de6f5', background:'#0b1729', phase:5.4,
    description:'Our home is a rocky planet with liquid oceans and an atmosphere that supports the only known life in the universe.',
    fact:'Earth is the only world where life has been confirmed so far.' },
  { id:'moon', name:'The Moon', kind:'NATURAL SATELLITE', radius:0, period:0.24, size:5, color:'#d2d6dc', glow:'#8897b2', accent:'#e3e7ee', background:'#131724', phase:1,
    description:'The Moon is Earth’s natural satellite. Its gravity contributes to ocean tides on our planet.',
    fact:'The Moon always shows nearly the same face to Earth because it rotates once per orbit.' },
  { id:'mars', name:'Mars', kind:'TERRESTRIAL PLANET', radius:108, period:2.7, size:8, color:'#db8066', glow:'#b44d3c', accent:'#ffb19c', background:'#1d131b', phase:1.9,
    description:'Mars is a cold, rocky desert world with polar ice, giant volcanoes and evidence of ancient flowing water.',
    fact:'Olympus Mons on Mars is the largest known volcano in the solar system.' },
  { id:'jupiter', name:'Jupiter', kind:'GAS GIANT', radius:135, period:5.4, size:17, color:'#d8aa89', glow:'#b16e55', accent:'#f7c8a7', background:'#1b151e', phase:3.3,
    description:'The largest planet, Jupiter is a gas giant with thick cloud bands and powerful storms.',
    fact:'Jupiter’s Great Red Spot is a storm that has been observed for centuries.' },
  { id:'saturn', name:'Saturn', kind:'GAS GIANT', radius:161, period:8.0, size:15, color:'#dfca9b', glow:'#aa865d', accent:'#f3dba5', background:'#1c1820', phase:0.6,
    description:'Saturn is a gas giant known for its spectacular ring system made largely of icy particles.',
    fact:'Saturn is less dense than water.' },
  { id:'uranus', name:'Uranus', kind:'ICE GIANT', radius:185, period:11.7, size:12, color:'#a1e2e6', glow:'#58b6b9', accent:'#a0f4eb', background:'#0b1b26', phase:4.4,
    description:'Uranus is a blue-green ice giant with methane in its atmosphere and an unusually tilted rotational axis.',
    fact:'Uranus spins almost on its side relative to its orbit.' },
  { id:'neptune', name:'Neptune', kind:'ICE GIANT', radius:207, period:16.0, size:12, color:'#5b80e8', glow:'#3151ae', accent:'#a3bfff', background:'#0c142b', phase:2.3,
    description:'Neptune is the outermost planet, a distant ice giant with an atmosphere of hydrogen, helium and methane.',
    fact:'Neptune was discovered in 1846 after predictions based on mathematics.' }
]);
export const ORBITAL_BODIES = Object.freeze(SOLAR_BODIES.filter(body=>body.radius>0));
export const BODY_BY_ID = Object.freeze(Object.fromEntries(SOLAR_BODIES.map(body=>[body.id,body])));
export const INITIAL_BODY = 'earth';
/** Scaled illustrative orbits; distances and periods are intentionally not to scale. */
export function positionAt(body,timeSeconds) {
  if (body.id==='sun') return {x:0,y:0,z:0};
  const angle = body.phase + 2*Math.PI*timeSeconds/(body.period*18);
  const radius = body.id==='moon' ? 13 : body.radius;
  return {x:Math.cos(angle)*radius,y:Math.sin(angle)*radius*.76,z:Math.sin(angle)*8};
}
export function positionsAt(timeSeconds) {
  const out={};
  for (const body of SOLAR_BODIES) {
    if(body.id!=='moon')out[body.id]=positionAt(body,timeSeconds);
  }
  const earth=out.earth;
  const moon=positionAt(BODY_BY_ID.moon,timeSeconds);
  out.moon={x:earth.x+moon.x,y:earth.y+moon.y,z:earth.z+moon.z};
  return out;
}
export const THEME_TOKENS=Object.freeze(Object.fromEntries(SOLAR_BODIES.map(({id,accent,background})=>[id,{accent,background,ink:'#081322',text:'#f2f6ff',muted:'#c5d0e6'}])));
export function hexRgb(hex) {const value=hex.replace('#','');return [0,2,4].map(i=>parseInt(value.slice(i,i+2),16));}
export function luminance(hex) {const channel=hexRgb(hex).map(c=>{const x=c/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*channel[0]+.7152*channel[1]+.0722*channel[2];}
export function contrastRatio(a,b) {const [high,low]=[luminance(a),luminance(b)].sort((x,y)=>y-x);return (high+.05)/(low+.05);}

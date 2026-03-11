const fs = require('fs');
const fdata = JSON.parse(fs.readFileSync('/tmp/f1data.json','utf8'));
const DATA_JSON = JSON.stringify(fdata);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>F1 Feeder Scout - Racing Talent Tracker</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0a0a0a;color:#e2e8f0;min-height:100vh}
.header{background:#1a1a2e;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #e10600;position:sticky;top:0;z-index:100}
.header h1{font-size:20px;color:#fff;font-weight:700}
.header h1 span{color:#e10600}
.nav{display:flex;gap:4px;background:#111;padding:8px 12px;overflow-x:auto;border-bottom:1px solid #222}
.nav button{background:none;border:none;color:#94a3b8;padding:8px 16px;cursor:pointer;font-size:13px;font-weight:600;border-radius:6px;white-space:nowrap;transition:all .2s}
.nav button:hover{color:#e2e8f0;background:#222}
.nav button.active{background:#e10600;color:#fff}
.container{max-width:1200px;margin:0 auto;padding:16px}
.grid{display:grid;gap:12px}
.grid-2{grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}
.grid-4{grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}
.card{background:#1a1a2e;border:1px solid #2a2a4e;border-radius:10px;padding:16px;transition:all .2s}
.card:hover{border-color:#e10600;transform:translateY(-1px)}
.card-click{cursor:pointer}
.stat-card{text-align:center;padding:20px}
.stat-card .num{font-size:28px;font-weight:800;color:#e10600}
.stat-card .label{font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-top:4px}
.stars{color:#e10600;font-size:14px}
.badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700}
.badge-a{background:#065f46;color:#6ee7b7}.badge-b{background:#92400e;color:#fbbf24}.badge-c{background:#7c2d12;color:#fb923c}
.badge-pos{background:#312e81;color:#a5b4fc}.badge-series{background:#1e3a5f;color:#60a5fa}.badge-academy{background:#4a1d6e;color:#c084fc}
.badge-sl{background:#065f46;color:#6ee7b7}
.driver-name{font-size:15px;font-weight:700;color:#fff}
.driver-meta{font-size:12px;color:#94a3b8;margin-top:2px}
.section-title{font-size:16px;font-weight:700;color:#fff;margin:20px 0 10px;padding-bottom:6px;border-bottom:2px solid #e10600;display:inline-block}
.report-card{border-left:3px solid #e10600}
.grades{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
.detail-back{color:#e10600;cursor:pointer;font-size:13px;margin-bottom:12px;display:inline-block}
.detail-back:hover{text-decoration:underline}
.feed-post{border-left:3px solid #e10600;padding-left:12px;margin-bottom:16px}
.feed-post .author{color:#e10600;font-weight:700;font-size:13px}
.feed-post .content{color:#cbd5e1;font-size:13px;margin-top:4px;line-height:1.5}
.feed-post .meta{color:#64748b;font-size:11px;margin-top:4px}
.type{display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase;margin-left:6px}
.type-analysis{background:#1e3a5f;color:#60a5fa}.type-market{background:#065f46;color:#6ee7b7}.type-prediction{background:#7c2d12;color:#fb923c}.type-update{background:#312e81;color:#a5b4fc}.type-breaking{background:#7f1d1d;color:#fca5a5}
.filter-row{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
.filter-row select{background:#222;color:#e2e8f0;border:1px solid #333;padding:6px 10px;border-radius:6px;font-size:12px}
.metric-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin-top:8px}
.metric-item{background:#111;padding:10px;border-radius:6px}
.metric-item .val{font-size:18px;font-weight:700;color:#e10600}
.metric-item .lbl{font-size:11px;color:#94a3b8}
.pos-1{color:#ffd700}.pos-2{color:#c0c0c0}.pos-3{color:#cd7f32}
.market-bar{height:8px;border-radius:4px;background:#222;overflow:hidden;margin-top:6px}
.market-fill{height:100%;border-radius:4px;background:#e10600}
@media(max-width:640px){.grid-4{grid-template-columns:1fr 1fr}.header h1{font-size:16px}.container{padding:10px}}
</style>
</head>
<body>
<div class="header">
<h1>F1 <span>Feeder</span> Scout</h1>
<div style="color:#94a3b8;font-size:12px">2025 Season</div>
</div>
<div class="nav" id="navBar"></div>
<div class="container" id="app"></div>
<script>
const DATA = ${DATA_JSON};
let currentTab='dashboard',detailDriver=null;
const TABS=['dashboard','drivers','teams','races','reports','market','feed'];

function init(){
  document.getElementById('navBar').innerHTML=TABS.map(function(t){return'<button onclick="showTab(\\''+t+'\\')">'+t.charAt(0).toUpperCase()+t.slice(1)+'</button>'}).join('');
  showTab('dashboard');
}
function showTab(t){currentTab=t;detailDriver=null;document.querySelectorAll('.nav button').forEach(function(b,i){b.className=TABS[i]===t?'active':''});render()}
function showDriver(id){detailDriver=id;render();window.scrollTo(0,0)}
function stars(n){return String.fromCharCode(9733).repeat(n)+String.fromCharCode(9734).repeat(5-n)}
function gradeBadge(g){if(!g)return'';return'<span class="badge badge-'+(g.startsWith('A')?'a':g.startsWith('B')?'b':'c')+'">'+g+'</span>'}
function getTeam(id){return DATA.teams.find(function(t){return t.id===id})}
function getDriver(id){return DATA.drivers.find(function(d){return d.id===id})}

function driverPoints(did){
  return DATA.race_results.filter(function(r){return r.driver_id===did}).reduce(function(s,r){return s+r.points_scored},0);
}

function render(){
  var el=document.getElementById('app');
  if(detailDriver)return renderDetail(el);
  ({dashboard:renderDash,drivers:renderDrivers,teams:renderTeams,races:renderRaces,reports:renderReports,market:renderMarket,feed:renderFeed}[currentTab]||renderDash)(el);
}

function renderDash(el){
  var h='<div class="grid grid-4" style="margin-bottom:20px">';
  h+='<div class="card stat-card"><div class="num">'+DATA.drivers.length+'</div><div class="label">Drivers</div></div>';
  h+='<div class="card stat-card"><div class="num">'+DATA.teams.length+'</div><div class="label">Teams</div></div>';
  h+='<div class="card stat-card"><div class="num">'+DATA.races.length+'</div><div class="label">Races</div></div>';
  h+='<div class="card stat-card"><div class="num">'+DATA.scouting_reports.length+'</div><div class="label">Reports</div></div></div>';

  h+='<div class="section-title">Championship Standings</div><div class="grid" style="gap:6px">';
  var standings=DATA.drivers.map(function(d){return{d:d,pts:driverPoints(d.id)}}).sort(function(a,b){return b.pts-a.pts}).slice(0,10);
  standings.forEach(function(x,i){
    var d=x.d,team=d.team_id?getTeam(d.team_id):null;
    h+='<div class="card" style="display:flex;justify-content:space-between;align-items:center;padding:10px 16px;cursor:pointer" onclick="showDriver('+d.id+')">';
    h+='<div style="display:flex;align-items:center;gap:12px"><div class="'+(i<3?'pos-'+(i+1):'')+'" style="font-size:18px;font-weight:800;width:24px">P'+(i+1)+'</div><div>';
    h+='<div class="driver-name" style="font-size:14px">'+d.first_name+' '+d.last_name+' <span class="badge badge-series">'+d.current_series+'</span></div>';
    h+='<div style="font-size:11px;color:#94a3b8">'+(team?team.name:d.current_series)+' &middot; '+d.nationality+'</div></div></div>';
    h+='<div style="font-size:20px;font-weight:800;color:#e10600">'+x.pts+' <span style="font-size:11px;color:#94a3b8">pts</span></div></div>';
  });
  h+='</div>';

  h+='<div class="section-title">Latest Intel</div>';
  DATA.feed_posts.slice(0,3).forEach(function(fp){
    h+='<div class="feed-post"><div class="author">'+fp.author+'<span class="type type-'+(fp.post_type||'analysis')+'">'+fp.post_type+'</span></div>';
    h+='<div class="content">'+fp.content.substring(0,200)+(fp.content.length>200?'...':'')+'</div>';
    h+='<div class="meta">'+fp.likes_count+' likes</div></div>';
  });
  el.innerHTML=h;
}

function renderDrivers(el){
  var series=[...new Set(DATA.drivers.map(function(d){return d.current_series}))].sort();
  var h='<div class="filter-row"><select id="fSeries" onchange="render()"><option value="">All Series</option>';
  series.forEach(function(s){h+='<option>'+s+'</option>'});
  h+='</select></div><div class="grid grid-2" id="dlist"></div>';
  el.innerHTML=h;
  var fs=document.getElementById('fSeries').value;
  var drivers=DATA.drivers.slice();
  if(fs)drivers=drivers.filter(function(d){return d.current_series===fs});
  drivers.sort(function(a,b){return(a.ranking||99)-(b.ranking||99)});
  h='';drivers.forEach(function(d){
    var team=d.team_id?getTeam(d.team_id):null;var pts=driverPoints(d.id);
    h+='<div class="card card-click" onclick="showDriver('+d.id+')">';
    h+='<div style="display:flex;justify-content:space-between"><div>';
    h+='<div class="driver-name">'+d.first_name+' '+d.last_name+'</div>';
    h+='<div class="driver-meta"><span class="badge badge-series">'+d.current_series+'</span> '+(team?team.name:'')+' &middot; '+d.nationality+'</div>';
    h+='<div style="margin-top:4px"><span class="stars">'+stars(d.rating)+'</span> <span style="color:#94a3b8;font-size:11px">#'+d.ranking+'</span></div>';
    if(d.academy)h+='<div style="margin-top:2px"><span class="badge badge-academy">'+d.academy+'</span></div>';
    h+='</div><div style="text-align:right">';
    h+='<div style="font-size:18px;font-weight:800;color:#e10600">'+pts+'</div><div style="font-size:10px;color:#94a3b8">PTS</div>';
    h+='</div></div>';
    h+='<div style="display:flex;gap:10px;margin-top:6px;font-size:11px;color:#94a3b8">';
    h+=d.career_wins+' wins &middot; '+d.career_podiums+' podiums &middot; '+d.career_poles+' poles';
    h+='</div>';
    h+='<div style="font-size:11px;margin-top:4px"><span class="badge '+(d.super_license_eligible?'badge-sl':'badge-pos')+'">SL: '+d.super_license_points+' pts'+(d.super_license_eligible?' (Eligible)':'')+'</span></div>';
    h+='</div>';
  });
  document.getElementById('dlist').innerHTML=h;
}

function renderDetail(el){
  var d=getDriver(detailDriver);if(!d){el.innerHTML='Not found';return}
  var team=d.team_id?getTeam(d.team_id):null;
  var pts=driverPoints(d.id);
  var results=DATA.race_results.filter(function(r){return r.driver_id===d.id});
  var reports=DATA.scouting_reports.filter(function(r){return r.driver_id===d.id});
  var perf=DATA.performance_metrics.find(function(m){return m.driver_id===d.id});
  var proj=DATA.f1_projections.find(function(p){return p.driver_id===d.id});
  var market=DATA.driver_market.find(function(m){return m.driver_id===d.id});

  var h='<div class="detail-back" onclick="detailDriver=null;render()">&larr; Back</div>';
  h+='<div class="card" style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:12px"><div>';
  h+='<div style="font-size:22px;font-weight:800;color:#fff">'+d.first_name+' '+d.last_name+'</div>';
  h+='<div style="margin-top:4px"><span class="badge badge-series">'+d.current_series+'</span> <span class="stars">'+stars(d.rating)+'</span> <span style="color:#94a3b8;font-size:12px">#'+d.ranking+'</span></div>';
  h+='<div style="color:#94a3b8;font-size:13px;margin-top:4px">'+d.nationality+' &middot; Age '+d.age+'</div>';
  if(team)h+='<div style="color:#60a5fa;font-size:13px">'+team.name+' ('+team.country+')</div>';
  if(d.academy)h+='<div style="margin-top:4px"><span class="badge badge-academy">'+d.academy+'</span></div>';
  h+='<div style="margin-top:4px"><span class="badge '+(d.super_license_eligible?'badge-sl':'badge-pos')+'">Super License: '+d.super_license_points+' pts'+(d.super_license_eligible?' - ELIGIBLE':'')+'</span></div>';
  h+='</div>';
  h+='<div style="text-align:right"><div style="font-size:28px;font-weight:800;color:#e10600">'+pts+'</div><div style="font-size:11px;color:#94a3b8">Season Points</div>';
  if(d.market_value)h+='<div style="font-size:16px;font-weight:700;color:#6ee7b7;margin-top:4px">$'+(d.market_value/1e6).toFixed(1)+'M</div><div style="font-size:11px;color:#94a3b8">Market Value</div>';
  h+='</div></div></div>';

  h+='<div class="section-title">Career Stats</div><div class="grid grid-4" style="margin-bottom:8px">';
  [['career_wins','Wins'],['career_podiums','Podiums'],['career_poles','Poles']].forEach(function(s){
    h+='<div class="card stat-card"><div class="num">'+d[s[0]]+'</div><div class="label">'+s[1]+'</div></div>';
  });
  h+='</div>';

  if(results.length){
    h+='<div class="section-title">Race Results</div><div class="grid" style="gap:6px">';
    results.forEach(function(r){
      var race=DATA.races.find(function(rc){return rc.id===r.race_id});
      h+='<div class="card" style="display:flex;justify-content:space-between;align-items:center;padding:10px 16px">';
      h+='<div><div style="font-weight:700;color:#fff">'+(race?race.race_name:'Race #'+r.race_id)+'</div>';
      h+='<div style="font-size:11px;color:#94a3b8">'+(race?race.circuit+' &middot; '+race.country:'')+'</div></div>';
      h+='<div style="text-align:right"><div class="'+(r.race_position<=3?'pos-'+r.race_position:'')+'" style="font-size:18px;font-weight:800">P'+r.race_position+'</div>';
      h+='<div style="font-size:11px;color:#94a3b8">'+r.points_scored+' pts'+(r.fastest_lap?' + FL':'')+'</div></div></div>';
    });
    h+='</div>';
  }

  if(perf){
    h+='<div class="section-title">Performance Metrics</div><div class="metric-grid">';
    var ms=[['race_pace_rating','','Race Pace'],['qualifying_pace_rating','','Quali Pace'],['tire_management_rating','','Tire Mgmt'],['wet_weather_rating','','Wet Weather'],['racecraft_rating','','Racecraft'],['consistency_rating','','Consistency'],['overtaking_rating','','Overtaking'],['defending_rating','','Defending'],['mental_strength_rating','','Mental'],['feedback_rating','','Feedback']];
    ms.forEach(function(m){if(perf[m[0]]!=null)h+='<div class="metric-item"><div class="val">'+perf[m[0]]+'/100</div><div class="lbl">'+m[2]+'</div></div>'});
    h+='</div>';
  }

  if(proj){
    h+='<div class="section-title">F1 Projection</div><div class="card">';
    h+='<div style="display:flex;gap:20px;flex-wrap:wrap">';
    h+='<div><div style="font-size:32px;font-weight:800;color:#e10600">'+proj.f1_probability+'%</div><div style="font-size:11px;color:#94a3b8">F1 Probability</div></div>';
    h+='<div><div style="font-size:18px;font-weight:700;color:#fff">'+proj.projected_entry_year+'</div><div style="font-size:11px;color:#94a3b8">Projected Entry</div></div>';
    if(proj.projected_team)h+='<div><div style="font-size:14px;color:#60a5fa">'+proj.projected_team+'</div><div style="font-size:11px;color:#94a3b8">Projected Team</div></div>';
    h+='</div>';
    if(proj.f1_comparison)h+='<div style="margin-top:8px;font-size:13px;color:#94a3b8">Comparison: <span style="color:#a78bfa">'+proj.f1_comparison+'</span> ('+proj.f1_comp_similarity+'% match)</div>';
    if(proj.projected_role)h+='<div style="font-size:13px;color:#94a3b8">Role: '+proj.projected_role+'</div>';
    h+='<div style="margin-top:8px;display:flex;gap:16px;font-size:12px">';
    if(proj.wdc_probability!=null)h+='<div><span style="color:#ffd700">WDC Prob:</span> '+proj.wdc_probability+'%</div>';
    if(proj.podium_probability!=null)h+='<div><span style="color:#c0c0c0">Podium Prob:</span> '+proj.podium_probability+'%</div>';
    h+='</div></div>';
  }

  if(reports.length){
    h+='<div class="section-title">Scouting Reports</div>';
    reports.forEach(function(r){
      h+='<div class="card report-card" style="margin-bottom:10px">';
      h+='<div style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:700;color:#e10600;font-size:13px">'+r.scout_name+'</div>';
      h+='<div class="grades">'+gradeBadge(r.overall_grade)+'</div></div>';
      if(r.strengths)h+='<div style="font-size:12px;margin-top:6px"><strong style="color:#6ee7b7">Strengths:</strong> '+r.strengths+'</div>';
      if(r.weaknesses)h+='<div style="font-size:12px;margin-top:4px"><strong style="color:#fbbf24">Weaknesses:</strong> '+r.weaknesses+'</div>';
      if(r.notes)h+='<div style="font-size:12px;margin-top:4px;color:#94a3b8">'+r.notes+'</div>';
      if(r.f1_readiness)h+='<div style="font-size:12px;margin-top:4px"><strong style="color:#e10600">F1 Readiness:</strong> '+r.f1_readiness+'</div>';
      if(r.comparison)h+='<div style="font-size:12px"><strong style="color:#a78bfa">Comp:</strong> '+r.comparison+'</div>';
      h+='</div>';
    });
  }
  el.innerHTML=h;
}

function renderTeams(el){
  var h='<div class="grid grid-2">';
  DATA.teams.forEach(function(t){
    var dc=DATA.drivers.filter(function(d){return d.team_id===t.id}).length;
    h+='<div class="card"><div style="font-size:16px;font-weight:700;color:#fff">'+t.name+'</div>';
    h+='<div style="font-size:12px;color:#94a3b8"><span class="badge badge-series">'+t.series+'</span> '+t.country+'</div>';
    h+='<div style="font-size:11px;color:#e10600;margin-top:4px">'+dc+' driver'+(dc>1?'s':'')+'</div>';
    var drivers=DATA.drivers.filter(function(d){return d.team_id===t.id});
    if(drivers.length){h+='<div style="margin-top:6px">';drivers.forEach(function(d){
      h+='<div style="font-size:12px;color:#cbd5e1;cursor:pointer" onclick="showDriver('+d.id+')">'+d.first_name+' '+d.last_name+' <span style="color:#94a3b8">('+driverPoints(d.id)+' pts)</span></div>';
    });h+='</div>'}
    h+='</div>';
  });
  el.innerHTML=h+'</div>';
}

function renderRaces(el){
  var h='';
  var bySeries={};DATA.races.forEach(function(r){if(!bySeries[r.series])bySeries[r.series]=[];bySeries[r.series].push(r)});
  Object.keys(bySeries).forEach(function(s){
    h+='<div class="section-title">'+s+' Calendar</div><div class="grid" style="gap:8px;margin-bottom:16px">';
    bySeries[s].forEach(function(r){
      var results=DATA.race_results.filter(function(rr){return rr.race_id===r.id}).sort(function(a,b){return a.race_position-b.race_position});
      h+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:start"><div>';
      h+='<div style="font-weight:700;color:#fff">Rd '+r.round_number+': '+r.race_name+'</div>';
      h+='<div style="font-size:12px;color:#94a3b8">'+r.circuit+' &middot; '+r.country+' &middot; '+r.race_date+'</div></div>';
      h+='<div><span class="badge '+(r.status==='Completed'?'badge-a':'badge-pos')+'">'+r.status+'</span></div></div>';
      if(results.length){h+='<div style="margin-top:8px">';results.slice(0,3).forEach(function(rr,i){
        var d=getDriver(rr.driver_id);
        h+='<div style="display:flex;justify-content:space-between;font-size:12px;padding:2px 0;border-bottom:1px solid #222"><div class="pos-'+(i+1)+'">P'+(i+1)+' '+(d?d.first_name+' '+d.last_name:'?')+'</div><div style="color:#94a3b8">'+rr.points_scored+' pts'+(rr.fastest_lap?' +FL':'')+'</div></div>';
      });h+='</div>'}
      h+='</div>';
    });
    h+='</div>';
  });
  el.innerHTML=h;
}

function renderReports(el){
  var h='<div class="section-title">Scouting Reports</div>';
  DATA.scouting_reports.forEach(function(r){
    var d=getDriver(r.driver_id);
    h+='<div class="card report-card" style="margin-bottom:10px;cursor:pointer" onclick="showDriver('+r.driver_id+')">';
    h+='<div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap"><div>';
    h+='<div class="driver-name">'+(d?d.first_name+' '+d.last_name:'?')+' <span class="badge badge-series">'+(d?d.current_series:'')+'</span></div>';
    h+='<div style="font-size:12px;color:#94a3b8">by '+r.scout_name+'</div></div>';
    h+='<div class="grades">'+gradeBadge(r.overall_grade)+'</div></div>';
    if(r.strengths)h+='<div style="font-size:12px;margin-top:8px"><strong style="color:#6ee7b7">Strengths:</strong> '+r.strengths+'</div>';
    if(r.weaknesses)h+='<div style="font-size:12px;margin-top:4px"><strong style="color:#fbbf24">Weaknesses:</strong> '+r.weaknesses+'</div>';
    if(r.notes)h+='<div style="font-size:12px;margin-top:4px;color:#94a3b8">'+r.notes+'</div>';
    if(r.f1_readiness)h+='<div style="font-size:12px;margin-top:4px"><strong style="color:#e10600">F1 Readiness:</strong> '+r.f1_readiness+'</div>';
    if(r.comparison)h+='<div style="font-size:12px"><strong style="color:#a78bfa">Comp:</strong> '+r.comparison+'</div>';
    h+='</div>';
  });
  el.innerHTML=h;
}

function renderMarket(el){
  var h='<div class="section-title">Driver Market</div><div class="grid" style="gap:10px">';
  DATA.driver_market.forEach(function(dm){
    var d=getDriver(dm.driver_id);if(!d)return;
    var team=d.team_id?getTeam(d.team_id):null;
    h+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:start"><div>';
    h+='<div class="driver-name" style="cursor:pointer" onclick="showDriver('+dm.driver_id+')">'+d.first_name+' '+d.last_name+' <span class="badge badge-series">'+d.current_series+'</span></div>';
    h+='<div style="font-size:12px;color:#94a3b8">'+(team?team.name:'')+' &middot; '+d.nationality+'</div></div>';
    h+='<div style="text-align:right"><div style="font-size:20px;font-weight:800;color:#e10600">'+dm.f1_readiness_score+'%</div><div style="font-size:10px;color:#94a3b8">F1 Readiness</div></div></div>';
    h+='<div class="market-bar"><div class="market-fill" style="width:'+dm.f1_readiness_score+'%"></div></div>';
    if(dm.interested_teams)h+='<div style="font-size:12px;color:#cbd5e1;margin-top:8px"><strong>Interested:</strong> '+dm.interested_teams+'</div>';
    if(dm.contract_status)h+='<div style="font-size:11px;color:#94a3b8;margin-top:4px">Contract: '+dm.contract_status+'</div>';
    h+='<div style="display:flex;gap:12px;font-size:11px;margin-top:4px;color:#94a3b8">';
    h+='<div>Market Value: $'+(d.market_value/1e6).toFixed(1)+'M</div>';
    if(d.f1_target_team)h+='<div>Target: '+d.f1_target_team+'</div>';
    h+='</div></div>';
  });
  el.innerHTML=h+'</div>';
}

function renderFeed(el){
  var h='<div class="section-title">Paddock Intel Feed</div>';
  DATA.feed_posts.forEach(function(fp){
    h+='<div class="feed-post"><div class="author">'+fp.author+'<span class="type type-'+(fp.post_type||'analysis')+'">'+fp.post_type+'</span></div>';
    h+='<div class="content">'+fp.content+'</div>';
    h+='<div class="meta">'+fp.likes_count+' likes &middot; '+fp.shares_count+' shares</div></div>';
  });
  el.innerHTML=h;
}

init();
</script>
</body>
</html>`;

fs.writeFileSync('/home/user/Grind-Session--neXT/f1-scout.html', html);
console.log('F1:', fs.statSync('/home/user/Grind-Session--neXT/f1-scout.html').size, 'bytes');

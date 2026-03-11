const fs = require('fs');
const fdata = JSON.parse(fs.readFileSync('/root/.claude/projects/-home-user-Grind-Session--neXT/2f71c1ad-2e59-4065-8468-74573a08afd8/tool-results/b78wyls09.txt','utf8'));
const bdata = JSON.parse(fs.readFileSync('/home/user/Grind-Session--neXT/src/lib/data.json','utf8'));

function buildFootball() {
const DATA_JSON = JSON.stringify(fdata);
return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HVU Insider - Football Scout</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0a0e1a;color:#e2e8f0;min-height:100vh}
.header{background:#041E42;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #CFB991;position:sticky;top:0;z-index:100}
.header h1{font-size:20px;color:#fff;font-weight:700}
.header h1 span{color:#CFB991}
.nav{display:flex;gap:4px;background:#0d1325;padding:8px 12px;overflow-x:auto;border-bottom:1px solid #1e293b}
.nav button{background:none;border:none;color:#94a3b8;padding:8px 16px;cursor:pointer;font-size:13px;font-weight:600;border-radius:6px;white-space:nowrap;transition:all .2s}
.nav button:hover{color:#e2e8f0;background:#1e293b}
.nav button.active{background:#041E42;color:#CFB991}
.container{max-width:1200px;margin:0 auto;padding:16px}
.grid{display:grid;gap:12px}
.grid-2{grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}
.grid-4{grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}
.card{background:#111827;border:1px solid #1e293b;border-radius:10px;padding:16px;transition:all .2s}
.card:hover{border-color:#CFB991;transform:translateY(-1px)}
.card-click{cursor:pointer}
.stat-card{text-align:center;padding:20px}
.stat-card .num{font-size:28px;font-weight:800;color:#CFB991}
.stat-card .label{font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-top:4px}
.stars{color:#CFB991;font-size:14px}
.badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700}
.badge-a{background:#065f46;color:#6ee7b7}.badge-b{background:#92400e;color:#fbbf24}.badge-c{background:#7c2d12;color:#fb923c}
.badge-pos{background:#1e3a5f;color:#60a5fa}.badge-status{background:#312e81;color:#a5b4fc}
.player-name{font-size:15px;font-weight:700;color:#fff}
.player-meta{font-size:12px;color:#94a3b8;margin-top:2px}
.section-title{font-size:16px;font-weight:700;color:#fff;margin:20px 0 10px;padding-bottom:6px;border-bottom:2px solid #CFB991;display:inline-block}
.report-card{border-left:3px solid #CFB991}
.grades{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
.detail-back{color:#CFB991;cursor:pointer;font-size:13px;margin-bottom:12px;display:inline-block}
.detail-back:hover{text-decoration:underline}
.feed-post{border-left:3px solid #CFB991;padding-left:12px;margin-bottom:16px}
.feed-post .author{color:#CFB991;font-weight:700;font-size:13px}
.feed-post .content{color:#cbd5e1;font-size:13px;margin-top:4px;line-height:1.5}
.feed-post .meta{color:#64748b;font-size:11px;margin-top:4px}
.type{display:inline-block;padding:1px 6px;border-radius:4px;font-size:10px;font-weight:700;text-transform:uppercase;margin-left:6px}
.type-intel{background:#1e3a5f;color:#60a5fa}.type-commit{background:#065f46;color:#6ee7b7}.type-challenge{background:#7c2d12;color:#fb923c}.type-update{background:#312e81;color:#a5b4fc}
.portal-bar{height:8px;border-radius:4px;background:#1e293b;overflow:hidden;margin-top:6px}
.portal-fill{height:100%;border-radius:4px}
.filter-row{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
.filter-row select{background:#1e293b;color:#e2e8f0;border:1px solid #334155;padding:6px 10px;border-radius:6px;font-size:12px}
.metric-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin-top:8px}
.metric-item{background:#0d1325;padding:10px;border-radius:6px}
.metric-item .val{font-size:18px;font-weight:700;color:#CFB991}
.metric-item .lbl{font-size:11px;color:#94a3b8}
@media(max-width:640px){.grid-4{grid-template-columns:1fr 1fr}.header h1{font-size:16px}.container{padding:10px}}
</style>
</head>
<body>
<div class="header">
<h1>HVU <span>Insider</span> Football Scout</h1>
<div style="color:#94a3b8;font-size:12px">2027 Recruiting</div>
</div>
<div class="nav" id="navBar"></div>
<div class="container" id="app"></div>
<script>
const DATA = ${DATA_JSON};
let currentTab='dashboard',detailPlayer=null;
const TABS=['dashboard','players','teams','games','reports','portal','feed'];

function init(){
  const nav=document.getElementById('navBar');
  nav.innerHTML=TABS.map(t=>'<button onclick="showTab(\\''+t+'\\')">'+t.charAt(0).toUpperCase()+t.slice(1)+'</button>').join('');
  showTab('dashboard');
}
function showTab(t){currentTab=t;detailPlayer=null;document.querySelectorAll('.nav button').forEach((b,i)=>b.className=TABS[i]===t?'active':'');render()}
function showPlayer(id){detailPlayer=id;render();window.scrollTo(0,0)}
function stars(n){return String.fromCharCode(9733).repeat(n)+String.fromCharCode(9734).repeat(5-n)}
function gradeBadge(g){if(!g)return'';return'<span class="badge badge-'+(g.startsWith('A')?'a':g.startsWith('B')?'b':'c')+'">'+g+'</span>'}
function getTeam(id){return DATA.teams.find(function(t){return t.id===id})}
function getPlayer(id){return DATA.players.find(function(p){return p.id===id})}

function render(){
  var el=document.getElementById('app');
  if(detailPlayer)return renderDetail(el);
  var fn={dashboard:renderDash,players:renderPlayers,teams:renderTeams,games:renderGames,reports:renderReports,portal:renderPortal,feed:renderFeed};
  (fn[currentTab]||renderDash)(el);
}

function renderDash(el){
  var h='<div class="grid grid-4" style="margin-bottom:20px">';
  h+='<div class="card stat-card"><div class="num">'+DATA.players.length+'</div><div class="label">Players</div></div>';
  h+='<div class="card stat-card"><div class="num">'+DATA.teams.length+'</div><div class="label">Teams</div></div>';
  h+='<div class="card stat-card"><div class="num">'+DATA.games.length+'</div><div class="label">Games</div></div>';
  h+='<div class="card stat-card"><div class="num">'+DATA.scouting_reports.length+'</div><div class="label">Reports</div></div></div>';
  h+='<div class="section-title">Top Prospects</div><div class="grid grid-2">';
  DATA.players.filter(function(p){return p.star_rating>=4}).sort(function(a,b){return(a.ranking||999)-(b.ranking||999)}).slice(0,8).forEach(function(p){
    h+='<div class="card card-click" onclick="showPlayer('+p.id+')">';
    h+='<div class="player-name">'+p.first_name+' '+p.last_name+'</div>';
    h+='<div class="player-meta"><span class="badge badge-pos">'+p.position+'</span> '+p.height+' / '+p.weight+'lbs &middot; Class '+p.class_year+'</div>';
    h+='<div style="margin-top:4px"><span class="stars">'+stars(p.star_rating)+'</span> '+(p.ranking?'<span style="color:#94a3b8;font-size:11px">#'+p.ranking+'</span>':'')+'</div>';
    h+='<div style="font-size:11px;color:#94a3b8;margin-top:4px">'+p.status+(p.committed_to?' &rarr; '+p.committed_to:'')+'</div></div>';
  });
  h+='</div>';
  h+='<div class="section-title">Latest Intel</div>';
  DATA.feed_posts.slice(0,4).forEach(function(fp){
    h+='<div class="feed-post"><div class="author">'+fp.author+'<span class="type type-'+fp.post_type+'">'+fp.post_type+'</span></div>';
    h+='<div class="content">'+fp.content.substring(0,200)+(fp.content.length>200?'...':'')+'</div>';
    h+='<div class="meta">'+fp.likes_count+' likes &middot; '+fp.shares_count+' shares</div></div>';
  });
  el.innerHTML=h;
}

function renderPlayers(el){
  var positions=[];DATA.players.forEach(function(p){if(positions.indexOf(p.position)<0)positions.push(p.position)});positions.sort();
  var years=[];DATA.players.forEach(function(p){if(years.indexOf(p.class_year)<0)years.push(p.class_year)});years.sort();
  var h='<div class="filter-row"><select id="fPos" onchange="render()"><option value="">All Positions</option>';
  positions.forEach(function(p){h+='<option>'+p+'</option>'});
  h+='</select><select id="fYear" onchange="render()"><option value="">All Classes</option>';
  years.forEach(function(y){h+='<option>'+y+'</option>'});
  h+='</select></div><div class="grid grid-2" id="plist"></div>';
  el.innerHTML=h;
  var fp=document.getElementById('fPos').value,fy=document.getElementById('fYear').value;
  var players=DATA.players.slice();
  if(fp)players=players.filter(function(p){return p.position===fp});
  if(fy)players=players.filter(function(p){return p.class_year==fy});
  players.sort(function(a,b){return b.star_rating-a.star_rating||(a.ranking||999)-(b.ranking||999)});
  h='';players.forEach(function(p){
    var team=p.team_id?getTeam(p.team_id):null;
    h+='<div class="card card-click" onclick="showPlayer('+p.id+')">';
    h+='<div class="player-name">'+p.first_name+' '+p.last_name+'</div>';
    h+='<div class="player-meta"><span class="badge badge-pos">'+p.position+'</span> '+p.height+' / '+p.weight+'lbs &middot; Class '+p.class_year+'</div>';
    h+='<div style="margin-top:4px"><span class="stars">'+stars(p.star_rating)+'</span> '+(p.ranking?'<span style="color:#94a3b8;font-size:11px">#'+p.ranking+'</span>':'')+'</div>';
    h+='<div style="font-size:11px;margin-top:4px"><span class="badge badge-status">'+p.status+'</span> '+(team?team.name:'')+(p.committed_to?' &rarr; '+p.committed_to:'')+'</div>';
    if(p.nil_value)h+='<div style="font-size:11px;color:#6ee7b7;margin-top:2px">NIL: $'+p.nil_value.toLocaleString()+'</div>';
    h+='</div>';
  });
  document.getElementById('plist').innerHTML=h;
}

function renderDetail(el){
  var p=getPlayer(detailPlayer);if(!p){el.innerHTML='Not found';return}
  var team=p.team_id?getTeam(p.team_id):null;
  var reports=DATA.scouting_reports.filter(function(r){return r.player_id===p.id});
  var metrics=DATA.football_metrics.find(function(m){return m.player_id===p.id});
  var schol=DATA.scholastic_data.find(function(s){return s.player_id===p.id});
  var nfl=DATA.nfl_projections.find(function(n){return n.player_id===p.id});
  var h='<div class="detail-back" onclick="detailPlayer=null;render()">&larr; Back</div>';
  h+='<div class="card" style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:12px"><div>';
  h+='<div style="font-size:22px;font-weight:800;color:#fff">'+p.first_name+' '+p.last_name+'</div>';
  h+='<div style="margin-top:4px"><span class="badge badge-pos">'+p.position+'</span> <span class="stars">'+stars(p.star_rating)+'</span> '+(p.ranking?'<span style="color:#94a3b8;font-size:12px">#'+p.ranking+'</span>':'')+'</div>';
  h+='<div style="color:#94a3b8;font-size:13px;margin-top:4px">'+p.height+' / '+p.weight+'lbs &middot; Class '+p.class_year+'</div>';
  h+='<div style="color:#94a3b8;font-size:13px">'+p.high_school+' &middot; '+p.hometown+', '+p.state+'</div>';
  if(team)h+='<div style="color:#60a5fa;font-size:13px;margin-top:2px">'+team.name+' ('+team.conference+')</div>';
  h+='<div style="margin-top:4px"><span class="badge badge-status">'+p.status+'</span>'+(p.committed_to?' <span style="color:#6ee7b7">&rarr; '+p.committed_to+'</span>':'')+'</div></div>';
  if(p.nil_value)h+='<div style="text-align:right"><div style="font-size:24px;font-weight:800;color:#6ee7b7">$'+p.nil_value.toLocaleString()+'</div><div style="font-size:11px;color:#94a3b8">Est. NIL Value</div></div>';
  h+='</div></div>';
  if(metrics){
    h+='<div class="section-title">Athletic Metrics</div><div class="metric-grid">';
    var ms=[['forty_yard','s','40-Yard Dash'],['top_speed_mph',' mph','Top Speed'],['vertical_jump','"','Vertical Jump'],['broad_jump','"','Broad Jump'],['shuttle','s','Shuttle'],['bench_press_reps','','Bench Reps'],['throw_velocity_mph',' mph','Throw Velocity'],['wingspan','','Wingspan'],['tackle_force_lbs',' lbs','Tackle Force']];
    ms.forEach(function(m){if(metrics[m[0]]!=null)h+='<div class="metric-item"><div class="val">'+metrics[m[0]]+m[1]+'</div><div class="lbl">'+m[2]+'</div></div>'});
    h+='</div>';
  }
  if(nfl){
    h+='<div class="section-title">NFL Projection</div><div class="card"><div style="display:flex;gap:20px;flex-wrap:wrap">';
    h+='<div><div style="font-size:32px;font-weight:800;color:#CFB991">'+nfl.draft_probability+'%</div><div style="font-size:11px;color:#94a3b8">Draft Prob</div></div>';
    h+='<div><div style="font-size:18px;font-weight:700;color:#fff">Round '+nfl.projected_round+'</div><div style="font-size:11px;color:#94a3b8">Pick: '+nfl.projected_pick_range+'</div></div>';
    h+='<div><div style="font-size:14px;color:#60a5fa">'+nfl.nfl_comparison+'</div><div style="font-size:11px;color:#94a3b8">Comp ('+nfl.nfl_comp_similarity+'%)</div></div></div>';
    h+='<div style="margin-top:8px;font-size:13px;color:#94a3b8">'+nfl.player_archetype+' &middot; '+nfl.projected_role+'</div>';
    h+='<div style="margin-top:8px;display:flex;gap:16px;font-size:12px">';
    h+='<div><span style="color:#6ee7b7">Rookie:</span> $'+(nfl.projected_rookie_contract/1e6).toFixed(0)+'M</div>';
    h+='<div><span style="color:#60a5fa">2nd:</span> $'+(nfl.projected_second_contract/1e6).toFixed(0)+'M</div>';
    h+='<div><span style="color:#CFB991">Career:</span> $'+(nfl.career_earnings_est/1e6).toFixed(0)+'M</div></div></div>';
  }
  if(schol){
    h+='<div class="section-title">Academics</div><div class="card"><div style="display:flex;gap:20px;flex-wrap:wrap;font-size:13px">';
    h+='<div><strong style="color:#CFB991">'+schol.gpa+'</strong> GPA</div>';
    h+='<div><strong style="color:#CFB991">'+schol.sat_score+'</strong> SAT</div>';
    h+='<div><strong style="color:#CFB991">'+schol.act_score+'</strong> ACT</div>';
    h+='<div><span class="badge '+(schol.ncaa_eligible?'badge-a':'badge-c')+'">'+(schol.ncaa_eligible?'NCAA Eligible':'Ineligible')+'</span></div>';
    h+='<div>Major: '+schol.intended_major+'</div></div></div>';
  }
  if(reports.length){
    h+='<div class="section-title">Scouting Reports</div>';
    reports.forEach(function(r){
      h+='<div class="card report-card" style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;align-items:center">';
      h+='<div style="font-weight:700;color:#CFB991;font-size:13px">'+r.scout_name+'</div>';
      h+='<div class="grades">'+gradeBadge(r.overall_grade)+(r.offensive_grade?' '+gradeBadge(r.offensive_grade):'')+(r.defensive_grade?' '+gradeBadge(r.defensive_grade):'')+(r.athleticism_grade?' '+gradeBadge(r.athleticism_grade):'')+'</div></div>';
      if(r.strengths)h+='<div style="font-size:12px;margin-top:6px"><strong style="color:#6ee7b7">Strengths:</strong> '+r.strengths+'</div>';
      if(r.weaknesses)h+='<div style="font-size:12px;margin-top:4px"><strong style="color:#fbbf24">Weaknesses:</strong> '+r.weaknesses+'</div>';
      if(r.notes)h+='<div style="font-size:12px;margin-top:4px;color:#94a3b8">'+r.notes+'</div>';
      if(r.projection)h+='<div style="font-size:12px;margin-top:4px"><strong style="color:#60a5fa">Projection:</strong> '+r.projection+'</div>';
      if(r.comparison)h+='<div style="font-size:12px"><strong style="color:#a78bfa">Comp:</strong> '+r.comparison+'</div>';
      h+='</div>';
    });
  }
  el.innerHTML=h;
}

function renderTeams(el){
  var h='<div class="grid grid-2">';
  DATA.teams.forEach(function(t){
    var c=DATA.players.filter(function(p){return p.team_id===t.id}).length;
    h+='<div class="card"><div style="font-size:16px;font-weight:700;color:#fff">'+t.name+'</div>';
    h+='<div style="font-size:12px;color:#94a3b8">'+t.conference+' &middot; '+t.city+', '+t.state+'</div>';
    if(c)h+='<div style="font-size:11px;color:#CFB991;margin-top:4px">'+c+' player'+(c>1?'s':'')+' tracked</div>';
    h+='</div>';
  });
  el.innerHTML=h+'</div>';
}

function renderGames(el){
  var h='<div class="section-title">Penn State 2025 Schedule</div><div class="grid" style="gap:8px">';
  DATA.games.forEach(function(g){
    var ht=getTeam(g.home_team_id),at=getTeam(g.away_team_id);
    var isPSU=g.home_team_id===1;
    h+='<div class="card" style="display:flex;justify-content:space-between;align-items:center"><div>';
    h+='<div style="font-weight:700;color:#fff">Wk '+g.week_number+': '+(ht?ht.name:'?')+' vs '+(at?at.name:'?')+'</div>';
    h+='<div style="font-size:12px;color:#94a3b8">'+g.venue+' &middot; '+g.game_date+'</div></div><div style="text-align:right">';
    if(g.status==='Final'){
      var win=(isPSU&&g.home_score>g.away_score)||(!isPSU&&g.away_score>g.home_score);
      h+='<div style="font-size:18px;font-weight:800;color:'+(win?'#6ee7b7':'#f87171')+'">'+g.home_score+' - '+g.away_score+'</div><div style="font-size:10px;color:#94a3b8">FINAL</div>';
    }else h+='<span class="badge badge-status">Scheduled</span>';
    h+='</div></div>';
  });
  el.innerHTML=h+'</div>';
}

function renderReports(el){
  var h='<div class="section-title">Scouting Reports</div>';
  DATA.scouting_reports.forEach(function(r){
    var p=getPlayer(r.player_id);
    h+='<div class="card report-card" style="margin-bottom:10px;cursor:pointer" onclick="showPlayer('+r.player_id+')">';
    h+='<div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap"><div>';
    h+='<div class="player-name">'+(p?p.first_name+' '+p.last_name:'?')+' <span class="badge badge-pos">'+(p?p.position:'')+'</span></div>';
    h+='<div style="font-size:12px;color:#94a3b8">by '+r.scout_name+'</div></div>';
    h+='<div class="grades">'+gradeBadge(r.overall_grade)+(r.offensive_grade?' '+gradeBadge(r.offensive_grade):'')+(r.defensive_grade?' '+gradeBadge(r.defensive_grade):'')+(r.athleticism_grade?' '+gradeBadge(r.athleticism_grade):'')+'</div></div>';
    if(r.strengths)h+='<div style="font-size:12px;margin-top:8px"><strong style="color:#6ee7b7">Strengths:</strong> '+r.strengths+'</div>';
    if(r.weaknesses)h+='<div style="font-size:12px;margin-top:4px"><strong style="color:#fbbf24">Weaknesses:</strong> '+r.weaknesses+'</div>';
    if(r.notes)h+='<div style="font-size:12px;margin-top:4px;color:#94a3b8">'+r.notes+'</div>';
    if(r.projection)h+='<div style="font-size:12px;margin-top:4px"><strong style="color:#60a5fa">Projection:</strong> '+r.projection+'</div>';
    if(r.comparison)h+='<div style="font-size:12px"><strong style="color:#a78bfa">Comp:</strong> '+r.comparison+'</div>';
    h+='</div>';
  });
  el.innerHTML=h;
}

function renderPortal(el){
  var h='<div class="section-title">Transfer Portal Watch</div><div class="grid" style="gap:10px">';
  DATA.transfer_portal.forEach(function(tp){
    var p=getPlayer(tp.player_id),team=p&&p.team_id?getTeam(p.team_id):null;
    var color=tp.transfer_likelihood>=70?'#ef4444':tp.transfer_likelihood>=50?'#fbbf24':'#60a5fa';
    h+='<div class="card"><div style="display:flex;justify-content:space-between;align-items:start"><div>';
    h+='<div class="player-name" style="cursor:pointer" onclick="showPlayer('+tp.player_id+')">'+(p?p.first_name+' '+p.last_name:'?')+' <span class="badge badge-pos">'+(p?p.position:'')+'</span></div>';
    h+='<div style="font-size:12px;color:#94a3b8">'+(team?team.name+' ('+team.conference+')':'')+'</div></div>';
    h+='<div style="text-align:right"><div style="font-size:24px;font-weight:800;color:'+color+'">'+tp.transfer_likelihood+'%</div><div style="font-size:10px;color:#94a3b8">Transfer Likelihood</div></div></div>';
    h+='<div class="portal-bar"><div class="portal-fill" style="width:'+tp.transfer_likelihood+'%;background:'+color+'"></div></div>';
    h+='<div style="font-size:12px;color:#cbd5e1;margin-top:8px">'+tp.reason+'</div>';
    h+='<div style="display:flex;gap:12px;font-size:11px;margin-top:6px;color:#94a3b8">';
    h+='<div>Playing Time: '+tp.current_playing_time_pct+'%</div><div>NIL Increase: +'+tp.projected_nil_increase+'%</div><span class="badge badge-status">'+tp.status+'</span></div></div>';
  });
  el.innerHTML=h+'</div>';
}

function renderFeed(el){
  var h='<div class="section-title">Coach Mike V Feed</div>';
  DATA.feed_posts.forEach(function(fp){
    h+='<div class="feed-post"><div class="author">'+fp.author+'<span class="type type-'+fp.post_type+'">'+fp.post_type+'</span></div>';
    h+='<div class="content">'+fp.content+'</div>';
    h+='<div class="meta">'+fp.likes_count+' likes &middot; '+fp.shares_count+' shares</div></div>';
  });
  el.innerHTML=h;
}

init();
</script>
</body>
</html>`;
}

function buildBasketball() {
const DATA_JSON = JSON.stringify(bdata);
return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EYBL Scout - Basketball</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0a0e1a;color:#e2e8f0;min-height:100vh}
.header{background:#111827;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #FF6B00;position:sticky;top:0;z-index:100}
.header h1{font-size:20px;color:#fff;font-weight:700}
.header h1 span{color:#FF6B00}
.nav{display:flex;gap:4px;background:#0d1325;padding:8px 12px;overflow-x:auto;border-bottom:1px solid #1e293b}
.nav button{background:none;border:none;color:#94a3b8;padding:8px 16px;cursor:pointer;font-size:13px;font-weight:600;border-radius:6px;white-space:nowrap;transition:all .2s}
.nav button:hover{color:#e2e8f0;background:#1e293b}
.nav button.active{background:#1e293b;color:#FF6B00}
.container{max-width:1200px;margin:0 auto;padding:16px}
.grid{display:grid;gap:12px}
.grid-2{grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}
.grid-4{grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}
.card{background:#111827;border:1px solid #1e293b;border-radius:10px;padding:16px;transition:all .2s}
.card:hover{border-color:#FF6B00;transform:translateY(-1px)}
.card-click{cursor:pointer}
.stat-card{text-align:center;padding:20px}
.stat-card .num{font-size:28px;font-weight:800;color:#FF6B00}
.stat-card .label{font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-top:4px}
.stars{color:#FF6B00;font-size:14px}
.badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700}
.badge-a{background:#065f46;color:#6ee7b7}.badge-b{background:#92400e;color:#fbbf24}.badge-c{background:#7c2d12;color:#fb923c}
.badge-pos{background:#7c2d12;color:#fb923c}.badge-status{background:#312e81;color:#a5b4fc}
.player-name{font-size:15px;font-weight:700;color:#fff}
.player-meta{font-size:12px;color:#94a3b8;margin-top:2px}
.section-title{font-size:16px;font-weight:700;color:#fff;margin:20px 0 10px;padding-bottom:6px;border-bottom:2px solid #FF6B00;display:inline-block}
.report-card{border-left:3px solid #FF6B00}
.grades{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
.detail-back{color:#FF6B00;cursor:pointer;font-size:13px;margin-bottom:12px;display:inline-block}
.detail-back:hover{text-decoration:underline}
.filter-row{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
.filter-row select{background:#1e293b;color:#e2e8f0;border:1px solid #334155;padding:6px 10px;border-radius:6px;font-size:12px}
.metric-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin-top:8px}
.metric-item{background:#0d1325;padding:10px;border-radius:6px}
.metric-item .val{font-size:18px;font-weight:700;color:#FF6B00}
.metric-item .lbl{font-size:11px;color:#94a3b8}
.avg-stat{text-align:center;padding:8px}
.avg-stat .val{font-size:22px;font-weight:800;color:#FF6B00}
.avg-stat .lbl{font-size:10px;color:#94a3b8;text-transform:uppercase}
@media(max-width:640px){.grid-4{grid-template-columns:1fr 1fr}.header h1{font-size:16px}.container{padding:10px}}
</style>
</head>
<body>
<div class="header">
<h1>EYBL <span>Scout</span> Basketball</h1>
<div style="color:#94a3b8;font-size:12px">2026 Season</div>
</div>
<div class="nav" id="navBar"></div>
<div class="container" id="app"></div>
<script>
const DATA = ${DATA_JSON};
let currentTab='dashboard',detailPlayer=null;
const TABS=['dashboard','players','teams','games','reports','analytics'];

function init(){
  document.getElementById('navBar').innerHTML=TABS.map(function(t){return'<button onclick="showTab(\\''+t+'\\')">'+t.charAt(0).toUpperCase()+t.slice(1)+'</button>'}).join('');
  showTab('dashboard');
}
function showTab(t){currentTab=t;detailPlayer=null;document.querySelectorAll('.nav button').forEach(function(b,i){b.className=TABS[i]===t?'active':''});render()}
function showPlayer(id){detailPlayer=id;render();window.scrollTo(0,0)}
function stars(n){return String.fromCharCode(9733).repeat(n)+String.fromCharCode(9734).repeat(5-n)}
function gradeBadge(g){if(!g)return'';return'<span class="badge badge-'+(g.startsWith('A')?'a':g.startsWith('B')?'b':'c')+'">'+g+'</span>'}
function getTeam(id){return DATA.teams.find(function(t){return t.id===id})}
function getPlayer(id){return DATA.players.find(function(p){return p.id===id})}

function playerAvg(pid){
  var s=DATA.player_stats.filter(function(ps){return ps.player_id===pid});
  if(!s.length)return{ppg:0,rpg:0,apg:0,spg:0,bpg:0,mpg:0,gp:0};
  var n=s.length;
  function avg(f){return Math.round(s.reduce(function(a,ps){return a+(ps[f]||0)},0)/n*10)/10}
  return{ppg:avg('points'),rpg:avg('rebounds'),apg:avg('assists'),spg:avg('steals'),bpg:avg('blocks'),mpg:avg('minutes'),gp:n};
}

function render(){
  var el=document.getElementById('app');
  if(detailPlayer)return renderDetail(el);
  ({dashboard:renderDash,players:renderPlayers,teams:renderTeams,games:renderGames,reports:renderReports,analytics:renderAnalytics}[currentTab]||renderDash)(el);
}

function renderDash(el){
  var h='<div class="grid grid-4" style="margin-bottom:20px">';
  h+='<div class="card stat-card"><div class="num">'+DATA.players.length+'</div><div class="label">Players</div></div>';
  h+='<div class="card stat-card"><div class="num">'+DATA.teams.length+'</div><div class="label">Teams</div></div>';
  h+='<div class="card stat-card"><div class="num">'+DATA.games.length+'</div><div class="label">Games</div></div>';
  h+='<div class="card stat-card"><div class="num">'+DATA.scouting_reports.length+'</div><div class="label">Reports</div></div></div>';
  h+='<div class="section-title">Top Scorers</div><div class="grid grid-2">';
  var scorers=DATA.players.map(function(p){var a=playerAvg(p.id);return{p:p,a:a}}).filter(function(x){return x.a.gp>0}).sort(function(a,b){return b.a.ppg-a.a.ppg}).slice(0,8);
  scorers.forEach(function(x){
    var p=x.p,a=x.a,team=getTeam(p.team_id);
    h+='<div class="card card-click" onclick="showPlayer('+p.id+')">';
    h+='<div style="display:flex;justify-content:space-between"><div>';
    h+='<div class="player-name">'+p.first_name+' '+p.last_name+'</div>';
    h+='<div class="player-meta"><span class="badge badge-pos">'+p.position+'</span> '+(team?team.name:'')+'</div></div>';
    h+='<div style="text-align:right"><div style="font-size:20px;font-weight:800;color:#FF6B00">'+a.ppg+'</div><div style="font-size:10px;color:#94a3b8">PPG</div></div></div>';
    h+='<div style="display:flex;gap:12px;margin-top:4px;font-size:11px;color:#94a3b8">'+a.rpg+' RPG &middot; '+a.apg+' APG &middot; '+a.gp+' GP</div></div>';
  });
  h+='</div>';
  h+='<div class="section-title">Recent Reports</div>';
  DATA.scouting_reports.slice(0,4).forEach(function(r){
    var p=getPlayer(r.player_id);
    h+='<div class="card report-card" style="margin-bottom:8px;cursor:pointer" onclick="showPlayer('+r.player_id+')">';
    h+='<div style="display:flex;justify-content:space-between"><div class="player-name">'+(p?p.first_name+' '+p.last_name:'?')+'</div>';
    h+='<div>'+gradeBadge(r.overall_grade)+'</div></div>';
    h+='<div style="font-size:12px;color:#94a3b8;margin-top:2px">'+r.scout_name+' &middot; '+r.projection+'</div></div>';
  });
  el.innerHTML=h;
}

function renderPlayers(el){
  var positions=['PG','SG','SF','PF','C'];
  var h='<div class="filter-row"><select id="fPos" onchange="render()"><option value="">All Positions</option>';
  positions.forEach(function(p){h+='<option>'+p+'</option>'});
  h+='</select><select id="fYear" onchange="render()"><option value="">All Classes</option><option>2026</option><option>2027</option></select></div>';
  h+='<div class="grid grid-2" id="plist"></div>';
  el.innerHTML=h;
  var fp=document.getElementById('fPos').value,fy=document.getElementById('fYear').value;
  var players=DATA.players.slice();
  if(fp)players=players.filter(function(p){return p.position===fp});
  if(fy)players=players.filter(function(p){return p.class_year==fy});
  players.sort(function(a,b){return b.star_rating-a.star_rating||(a.ranking||999)-(b.ranking||999)});
  h='';players.forEach(function(p){
    var team=getTeam(p.team_id),a=playerAvg(p.id);
    h+='<div class="card card-click" onclick="showPlayer('+p.id+')">';
    h+='<div class="player-name">'+p.first_name+' '+p.last_name+'</div>';
    h+='<div class="player-meta"><span class="badge badge-pos">'+p.position+'</span> '+p.height+' / '+p.weight+'lbs &middot; '+(team?team.name:'')+'</div>';
    h+='<div style="margin-top:4px"><span class="stars">'+stars(p.star_rating)+'</span> '+(p.ranking?'<span style="color:#94a3b8;font-size:11px">#'+p.ranking+'</span>':'')+'</div>';
    if(a.gp)h+='<div style="font-size:11px;color:#94a3b8;margin-top:4px">'+a.ppg+' PPG &middot; '+a.rpg+' RPG &middot; '+a.apg+' APG ('+a.gp+' games)</div>';
    h+='</div>';
  });
  document.getElementById('plist').innerHTML=h;
}

function renderDetail(el){
  var p=getPlayer(detailPlayer);if(!p){el.innerHTML='Not found';return}
  var team=getTeam(p.team_id),a=playerAvg(p.id);
  var reports=DATA.scouting_reports.filter(function(r){return r.player_id===p.id});
  var phys=DATA.physical_metrics.find(function(m){return m.player_id===p.id});
  var schol=DATA.scholastic_data.find(function(s){return s.player_id===p.id});
  var nba=DATA.nba_projections.find(function(n){return n.player_id===p.id});
  var nup=DATA.nextup_profiles.find(function(n){return n.player_id===p.id});
  var h='<div class="detail-back" onclick="detailPlayer=null;render()">&larr; Back</div>';
  h+='<div class="card" style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:12px"><div>';
  h+='<div style="font-size:22px;font-weight:800;color:#fff">'+p.first_name+' '+p.last_name+'</div>';
  h+='<div style="margin-top:4px"><span class="badge badge-pos">'+p.position+'</span> <span class="stars">'+stars(p.star_rating)+'</span> '+(p.ranking?'<span style="color:#94a3b8;font-size:12px">#'+p.ranking+'</span>':'')+'</div>';
  h+='<div style="color:#94a3b8;font-size:13px;margin-top:4px">'+p.height+' / '+p.weight+'lbs &middot; Class '+p.class_year+'</div>';
  h+='<div style="color:#94a3b8;font-size:13px">'+(p.high_school||'')+' &middot; '+(p.hometown||'')+', '+(p.state||'')+'</div>';
  if(team)h+='<div style="color:#FF6B00;font-size:13px;margin-top:2px">'+team.name+'</div>';
  h+='</div></div></div>';
  if(a.gp){
    h+='<div class="section-title">Season Averages ('+a.gp+' games)</div><div class="grid grid-4" style="margin-bottom:8px">';
    [['ppg','PPG'],['rpg','RPG'],['apg','APG'],['spg','SPG'],['bpg','BPG'],['mpg','MPG']].forEach(function(s){
      h+='<div class="card avg-stat"><div class="val">'+a[s[0]]+'</div><div class="lbl">'+s[1]+'</div></div>';
    });
    h+='</div>';
  }
  if(phys){
    h+='<div class="section-title">Physical Metrics</div><div class="metric-grid">';
    [['wingspan','','Wingspan'],['standing_reach','','Standing Reach'],['vertical_jump','"','Vertical'],['max_vertical','"','Max Vertical'],['speed_mph',' mph','Speed'],['lane_agility','s','Lane Agility'],['sprint_3qt','s','3/4 Sprint'],['hand_length','"','Hand Length'],['body_fat_pct','%','Body Fat'],['bench_press_reps','','Bench Reps']].forEach(function(m){
      if(phys[m[0]]!=null)h+='<div class="metric-item"><div class="val">'+phys[m[0]]+m[1]+'</div><div class="lbl">'+m[2]+'</div></div>';
    });
    h+='</div>';
  }
  if(nba){
    h+='<div class="section-title">NBA Projection</div><div class="card">';
    h+='<div style="display:flex;gap:20px;flex-wrap:wrap">';
    h+='<div><div style="font-size:32px;font-weight:800;color:#FF6B00">'+nba.draft_probability.toFixed(0)+'%</div><div style="font-size:11px;color:#94a3b8">Draft Prob</div></div>';
    h+='<div><div style="font-size:18px;font-weight:700;color:#fff">Round '+nba.projected_round+'</div><div style="font-size:11px;color:#94a3b8">Pick: '+nba.projected_pick_range+'</div></div>';
    h+='<div><div style="font-size:14px;color:#60a5fa">'+nba.nba_comparison+'</div><div style="font-size:11px;color:#94a3b8">Comp ('+nba.nba_comp_similarity+'%)</div></div></div>';
    h+='<div style="margin-top:8px;font-size:13px;color:#94a3b8">'+nba.player_archetype+' &middot; '+nba.projected_role+'</div>';
    h+='<div style="margin-top:8px;display:flex;gap:16px;font-size:12px">';
    h+='<div><span style="color:#6ee7b7">Rookie:</span> $'+(nba.projected_salary_rookie/1e6).toFixed(1)+'M</div>';
    h+='<div><span style="color:#60a5fa">Yr5:</span> $'+(nba.projected_salary_yr5/1e6).toFixed(1)+'M</div>';
    h+='<div><span style="color:#FF6B00">Career:</span> $'+(nba.career_earnings_est/1e6).toFixed(0)+'M</div></div></div>';
  }
  if(schol){
    h+='<div class="section-title">Academics</div><div class="card"><div style="display:flex;gap:20px;flex-wrap:wrap;font-size:13px">';
    h+='<div><strong style="color:#FF6B00">'+schol.gpa+'</strong> GPA</div>';
    h+='<div><strong style="color:#FF6B00">'+schol.sat_score+'</strong> SAT</div>';
    h+='<div><strong style="color:#FF6B00">'+schol.act_score+'</strong> ACT</div>';
    h+='<div><span class="badge '+(schol.ncaa_eligible?'badge-a':'badge-c')+'">'+(schol.ncaa_eligible?'NCAA Eligible':'Ineligible')+'</span></div>';
    if(schol.intended_major)h+='<div>Major: '+schol.intended_major+'</div>';
    h+='</div></div>';
  }
  if(reports.length){
    h+='<div class="section-title">Scouting Reports</div>';
    reports.forEach(function(r){
      h+='<div class="card report-card" style="margin-bottom:10px">';
      h+='<div style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:700;color:#FF6B00;font-size:13px">'+r.scout_name+'</div>';
      h+='<div class="grades">'+gradeBadge(r.overall_grade)+(r.offensive_grade?' '+gradeBadge(r.offensive_grade):'')+(r.defensive_grade?' '+gradeBadge(r.defensive_grade):'')+(r.athleticism_grade?' '+gradeBadge(r.athleticism_grade):'')+(r.basketball_iq_grade?' '+gradeBadge(r.basketball_iq_grade):'')+'</div></div>';
      if(r.strengths)h+='<div style="font-size:12px;margin-top:6px"><strong style="color:#6ee7b7">Strengths:</strong> '+r.strengths+'</div>';
      if(r.weaknesses)h+='<div style="font-size:12px;margin-top:4px"><strong style="color:#fbbf24">Weaknesses:</strong> '+r.weaknesses+'</div>';
      if(r.notes)h+='<div style="font-size:12px;margin-top:4px;color:#94a3b8">'+r.notes+'</div>';
      if(r.projection)h+='<div style="font-size:12px;margin-top:4px"><strong style="color:#60a5fa">Projection:</strong> '+r.projection+'</div>';
      if(r.comparison)h+='<div style="font-size:12px"><strong style="color:#a78bfa">Comp:</strong> '+r.comparison+'</div>';
      h+='</div>';
    });
  }
  el.innerHTML=h;
}

function renderTeams(el){
  var h='<div class="grid grid-2">';
  DATA.teams.forEach(function(t){
    var c=DATA.players.filter(function(p){return p.team_id===t.id}).length;
    h+='<div class="card"><div style="font-size:16px;font-weight:700;color:#fff">'+t.name+'</div>';
    h+='<div style="font-size:12px;color:#94a3b8">'+t.program+' &middot; '+t.city+', '+t.state+'</div>';
    h+='<div style="font-size:11px;color:#FF6B00;margin-top:4px">'+c+' player'+(c>1?'s':'')+'</div></div>';
  });
  el.innerHTML=h+'</div>';
}

function renderGames(el){
  var sessions={};
  DATA.games.forEach(function(g){if(!sessions[g.session_name])sessions[g.session_name]=[];sessions[g.session_name].push(g)});
  var h='';
  Object.keys(sessions).forEach(function(s){
    h+='<div class="section-title">'+s+'</div><div class="grid" style="gap:8px;margin-bottom:16px">';
    sessions[s].forEach(function(g){
      var ht=getTeam(g.home_team_id),at=getTeam(g.away_team_id);
      h+='<div class="card" style="display:flex;justify-content:space-between;align-items:center"><div>';
      h+='<div style="font-weight:700;color:#fff">'+(ht?ht.name:'?')+' vs '+(at?at.name:'?')+'</div>';
      h+='<div style="font-size:12px;color:#94a3b8">'+g.game_date+' &middot; '+g.venue+'</div></div>';
      h+='<div style="text-align:right">';
      if(g.status==='Final')h+='<div style="font-size:18px;font-weight:800;color:#e2e8f0">'+g.home_score+' - '+g.away_score+'</div><div style="font-size:10px;color:#94a3b8">FINAL</div>';
      else h+='<span class="badge badge-status">Scheduled</span>';
      h+='</div></div>';
    });
    h+='</div>';
  });
  el.innerHTML=h;
}

function renderReports(el){
  var h='<div class="section-title">All Scouting Reports</div>';
  DATA.scouting_reports.forEach(function(r){
    var p=getPlayer(r.player_id);
    h+='<div class="card report-card" style="margin-bottom:10px;cursor:pointer" onclick="showPlayer('+r.player_id+')">';
    h+='<div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap"><div>';
    h+='<div class="player-name">'+(p?p.first_name+' '+p.last_name:'?')+' <span class="badge badge-pos">'+(p?p.position:'')+'</span></div>';
    h+='<div style="font-size:12px;color:#94a3b8">by '+r.scout_name+'</div></div>';
    h+='<div class="grades">'+gradeBadge(r.overall_grade)+(r.offensive_grade?' '+gradeBadge(r.offensive_grade):'')+(r.defensive_grade?' '+gradeBadge(r.defensive_grade):'')+(r.athleticism_grade?' '+gradeBadge(r.athleticism_grade):'')+(r.basketball_iq_grade?' '+gradeBadge(r.basketball_iq_grade):'')+'</div></div>';
    if(r.strengths)h+='<div style="font-size:12px;margin-top:8px"><strong style="color:#6ee7b7">Strengths:</strong> '+r.strengths+'</div>';
    if(r.weaknesses)h+='<div style="font-size:12px;margin-top:4px"><strong style="color:#fbbf24">Weaknesses:</strong> '+r.weaknesses+'</div>';
    if(r.notes)h+='<div style="font-size:12px;margin-top:4px;color:#94a3b8">'+r.notes+'</div>';
    if(r.projection)h+='<div style="font-size:12px;margin-top:4px"><strong style="color:#60a5fa">Projection:</strong> '+r.projection+'</div>';
    if(r.comparison)h+='<div style="font-size:12px"><strong style="color:#a78bfa">Comp:</strong> '+r.comparison+'</div>';
    h+='</div>';
  });
  el.innerHTML=h;
}

function renderAnalytics(el){
  var h='<div class="section-title">Player Rankings by Star Rating</div><div class="grid" style="gap:6px">';
  DATA.players.slice().sort(function(a,b){return b.star_rating-a.star_rating||(a.ranking||999)-(b.ranking||999)}).forEach(function(p,i){
    var a=playerAvg(p.id),team=getTeam(p.team_id);
    h+='<div class="card" style="display:flex;justify-content:space-between;align-items:center;padding:10px 16px;cursor:pointer" onclick="showPlayer('+p.id+')">';
    h+='<div style="display:flex;align-items:center;gap:12px"><div style="font-size:16px;font-weight:800;color:#94a3b8;width:24px">'+(i+1)+'</div><div>';
    h+='<div class="player-name" style="font-size:14px">'+p.first_name+' '+p.last_name+' <span class="badge badge-pos">'+p.position+'</span></div>';
    h+='<div style="font-size:11px;color:#94a3b8"><span class="stars">'+stars(p.star_rating)+'</span> '+(team?team.name:'')+'</div></div></div>';
    h+='<div style="text-align:right;font-size:12px;color:#94a3b8">'+(a.gp?a.ppg+' PPG':'')+'</div></div>';
  });
  h+='</div>';
  h+='<div class="section-title">NBA Draft Probability</div><div class="grid" style="gap:6px">';
  DATA.nba_projections.slice().sort(function(a,b){return b.draft_probability-a.draft_probability}).slice(0,15).forEach(function(nba){
    var p=getPlayer(nba.player_id);if(!p)return;
    h+='<div class="card" style="display:flex;justify-content:space-between;align-items:center;padding:10px 16px;cursor:pointer" onclick="showPlayer('+nba.player_id+')">';
    h+='<div><div class="player-name" style="font-size:14px">'+p.first_name+' '+p.last_name+' <span class="badge badge-pos">'+p.position+'</span></div>';
    h+='<div style="font-size:11px;color:#94a3b8">'+nba.nba_comparison+' &middot; Round '+nba.projected_round+'</div></div>';
    h+='<div style="font-size:20px;font-weight:800;color:#FF6B00">'+nba.draft_probability.toFixed(0)+'%</div></div>';
  });
  h+='</div>';
  el.innerHTML=h;
}

init();
</script>
</body>
</html>`;
}

fs.writeFileSync('/home/user/Grind-Session--neXT/football-scout.html', buildFootball());
fs.writeFileSync('/home/user/Grind-Session--neXT/basketball-scout.html', buildBasketball());
console.log('Football:', fs.statSync('/home/user/Grind-Session--neXT/football-scout.html').size, 'bytes');
console.log('Basketball:', fs.statSync('/home/user/Grind-Session--neXT/basketball-scout.html').size, 'bytes');

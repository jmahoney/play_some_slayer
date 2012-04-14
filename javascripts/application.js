// globals
var megaplaya = false;
var search_visible = true;
var keyboard_disabled = false;
var slayer = 'slayer live';

// parse any hashbangs and use that as search right away
$(document).ready(function(){
	
	if( navigator.userAgent.match(/Android/i)
	 || navigator.userAgent.match(/webOS/i)
	 || navigator.userAgent.match(/iPhone/i)
	 || navigator.userAgent.match(/iPad/i)
	 || navigator.userAgent.match(/iPod/i)
	 || navigator.userAgent.match(/BlackBerry/i)
	 ){
		window.location = "http://vhx.tv/cheerschopper/play-some-slayer";
	} else {
	  load_player();
	  redraw();
	  $('#background').click(skip_video);
		
	}
});


$(window).resize(redraw);


function redraw() {
  $('#player').css('height', $(window).height() + 'px');
  $('#player').css('width', $(window).width() + 'px');

  $('#background').css('height', $(window).height() + 'px');
  $('#background').css('width', $(window).width() + 'px');


  $('#search_wrapper').css('width', $(window).width() + 'px');
  $('#search_wrapper').css('top', $(window).height() / 2 - 243 / 2);

  
// if doc-width < #search_wrapper width, offset it so things remain centered
  if($(window).width() < $('#query').width()) {
    $('#search_wrapper').css('left', (($(window).width() - $('#query').width())/2) + 'px');
  }
}

function skip_video(){
  if(!megaplaya){
    debug("Megaplaya not loaded, can't skip yet");
    return false;
  }

  debug("Skipping video...");
  megaplaya.api_nextVideo();
}

function get_query(){
  //return $('#query')[0].value;
	return slayer;
}


function load_player(){
  debug(">> load_player()");

  $('#player').flash({
    swf: 'http://vhx.tv/embed/megaplaya',
    width: '100%;',
    height: '100%',
    allowFullScreen: true,
    allowScriptAccess: "always"
  });
}

function toggle_search(){
  if(search_visible){
    hide_search();
  }
  else {
    show_search();
  }
}

function show_search(){

  if (search_visible){
    debug("show_search(): already visible but showing anyway");
    // return;
  }

  $('#showme').animate({ top: ($('#search_wrapper').position().top - $('#showme').height() + 60) + 'px' }, 1500, 'easeOutElastic');
  $('#search').fadeIn('fast', function(){ $('#query').select(); });
  // $('#vhx_logo').fadeIn('fast');
  search_visible = true;
}

function hide_search(){
  $('#background').css('background', 'transparent');
  $('#background').css('height', '70%'); // Don't go all the way to the bottom -- allow YouTube ad to be closed
  // $('#background').hide();

  if(!search_visible){
    return;
  }

  $('#query').blur();
  $('#search').fadeOut('slow');
  $('#vhx_logo').hide();

  search_visible = false;
}

function megaplaya_loaded(){
  debug(">> megaplaya_loaded()");
  megaplaya = $('#player').children()[0];
  megaplaya.api_disable();

  $(window).keydown(handle_keydown);
  // megaplaya.api_addListener('onKeyboardDown', handle_megaplaya_keydown);

  /*if(window.location.hash){
      debug("hash is present, executing searching!");
      $('#search').hide();
      execute_search(get_query_from_hash());
    }
    else {
      show_search();
    }*/
  execute_search(slayer);
}

function disable_keyboard(){
  debug("disable_keyboard()");
  keyboard_disabled = true;
}

function enable_keyboard(){
  debug("enable_keyboard()");
  keyboard_disabled = false;
}

function handle_keydown(e){
  if(keyboard_disabled || !megaplaya || e.shiftKey || e.ctrlKey || e.metaKey){
    return true;
  };

  var code = e.keyCode;
  switch(code){
  case 32: // Spacebar
    debug("SPACEBAR");
    megaplaya.api_toggle();
    break;
  case 37: // Left arrow
    debug("<--");
    megaplaya.api_prevVideo();
    break;
  case 39: // Right arrow
    debug("-->");
    megaplaya.api_nextVideo();
    break;
  }
  return true;
}

function submit_search(){
  var query = get_query();
  if(query == undefined || query == ''){
    debug(">> no query specified, doing something at random");
    query = random_query();
  }
  else {
    debug(">> search() query="+query);
  }
  var encoded = '#'+encodeURIComponent(query.replace(/\s/g, '_'));
  window.location.hash = encoded;
  // hashchange then executes search()
}

function execute_search(query){
  $('#title').hide();
  $('#player').show();
  hide_search();
  search_youtube(query);
  // search_vimeo(query);

  return false;
}

function search_vimeo(query){
  // TODO: Vimeo API requires authentication for search :-(
}

function search_youtube(query){
  debug(">> search_youtube() query="+query);
  var results = 50;
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', 'http://gdata.youtube.com/feeds/videos?vq=' + query +
         '&max-results=' + results + '&alt=json-in-script&' +
         'callback=search_youtube_callback&orderby=relevance&' +
         'sortorder=descending&format=5&fmt=18');
  document.documentElement.firstChild.appendChild(script);
}

function search_youtube_callback(resp){
  if(resp.feed.entry == undefined) {
    set_query("No results, sorry dawg");
    show_search();
    return false;
  }

  var urls = $.map(resp.feed.entry, function(entry,i){ return {url: entry.link[0].href}; });
  debug(">> search_youtube_callback(): loading "+urls.length+" videos...");

  urls = shuffle(urls);
  return megaplaya.api_playQueue(urls);
}

function debug(string){
  try {
    console.log(string);
  } catch(e) { }
}

function shuffle(v){
  for(var j, x, i = v.length; i; j = parseInt(Math.random() * i, 0), x = v[--i], v[i] = v[j], v[j] = x);
  return v;
}

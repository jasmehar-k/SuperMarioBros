var instructions_shown = false;
var walk_num = 1;
var elements = ["cloud", "baby_cloud", "bush", "hill", "ground1", "ground2", "ground3", "ground4", "goomba", "pipe", "plant", "platform", 'platform2', "game_coin"];
var enemies = ["goomba", "pipe", "plant"];
var pipe = ["pipe", "plant"];
var blocks = ["ground1", "ground3", "platform", "platform2"];
var key_states = [false, false, false, false]; //up, down, left, right
var step_length = 10;
var jumping = false;
var dir = -1; // direction: right is -1 and left is 1:
var steps = 0;
var output = "alive";
var above = false;
var block_below_mario = 0;
var score = 0;
var time = 180;
var lives = 3;
var coin = 0;
var is_game_started = false;
var block_x;
var block_y;
var block_width;
var mario_x = getXPosition("mario");
var mario_y = getYPosition("mario");
var mario_width;
var is_end_game = false; 
var total_score = 0;
var win_steps = 1000; // after how many steps the castle appears, change to a lower value to test the leaderboard at the end.


// jump function
function jump(){
  if (jumping == false){
    jumping = true;
    
    if (is_end_game == false){
      playSound("assets/jump.mp3", false);
      setImageURL("mario", "mario_jump" + dir + ".png");
    }
    
    var y = 1;
    timedLoop(40, function(){
      setPosition("mario", getXPosition("mario"), getYPosition("mario") - 10);
      y++;
      if (y > 12 || above == true){
        stopTimedLoop();
      }
    });
    if(key_states[2] || key_states[3]){
      walk(1);
      walk(1);
      walk(1);
    }
    setTimeout(function(){
      fall();
    }, 500);
  }
}

// this function makes it seem like mario is moving by making all the other elements move by
function walk(no_of_steps){
  for (var i = 0; i < elements.length; i++){
    var ob_x = getXPosition(elements[i]);
    var ob_y = getYPosition(elements[i]);
    var ob_width = getProperty(elements[i], "width");
    
    setPosition(elements[i], ob_x + (no_of_steps * (step_length*dir)), ob_y);
    
    if (ob_x >= 320 && enemies.indexOf(elements[i]) == -1 && elements[i] != "castle"){
      setPosition(elements[i], 1-ob_width, ob_y);
    } else if(ob_x + ob_width <= 0 && enemies.indexOf(elements[i]) == -1 && elements[i] != "castle"){
      setPosition(elements[i], 319, ob_y);
    }
  }
  ground();
  steps -= dir;
  set_score(-1*dir);
  if (steps == win_steps){
    show_castle();
  }
  else if (steps > win_steps && getXPosition("castle") <= 40){
    won_game();
  }
}

// this function makes it so there's always ground underneath by looping the two sets of ground blocks
function ground(){
  if (getXPosition("ground1") > 0){
    setPosition("ground3", getXPosition("ground1")-320, getYPosition("ground3"));
    setPosition("ground4", getXPosition("ground1") -320, getYPosition("ground4"));
  }
    if (getXPosition("ground1") < 0){
    setPosition("ground3", getXPosition("ground1") + 320, getYPosition("ground3"));
    setPosition("ground4", getXPosition("ground1") + 320, getYPosition("ground4"));
  }
}

// collision detection for enemies
var goomba_interval;
function collision(enemy){
  if (output == "alive"){
    var enemy_x = getXPosition(enemy);
    var enemy_y = getYPosition(enemy);
    var mario_y = getYPosition("mario") + 6;
    if (((enemy_y>mario_y && enemy_y < mario_y + 84) 
        || (enemy_y < mario_y && mario_y< enemy_y + getProperty(enemy, "height"))) 
        && ((enemy_x> 110 && enemy_x < 172)||(enemy_x < 110 && 110 < getProperty(enemy, "width")))  
        && (enemy != "plant" || getYPosition("plant") < 275) ){
      
      if (enemy_y - mario_y >= 55 && enemy != "plant"){
        playSound("Goomba-Stomp-Sound-(Sound-Effect).mp3");
        console.log("jumped");
        output = "jump";
        score+= 50;
        
      }
      else{
        console.log("enemy_y: ");
        console.log ("enemy_y: " + enemy_y + " \n mario_y: " + mario_y + "\n enemy_y - mario_y: " + enemy_y - mario_y);
        output = "dead";
        // console.log("died");
        playSound("assets/die.mp3", false);
        dead();
      }
      enemy_done(enemy);
    }
 }
}

// function to remove an enemy
function enemy_done(enemy){
  if (elements.indexOf(enemy) != -1){
    log_message("elements before remove:" + elements.length);
    log_message("remove:" + enemy + ". remaining elements=" + elements);
    removeItem(elements, elements.indexOf(enemy));
    clearInterval(goomba_interval);
    clearInterval(plant_interval);
    hideElement(enemy);
  }
}
// this function controls the goombas
function goomba(){
  showElement("goomba");
  if (elements.indexOf("goomba") == -1){
    appendItem(elements, "goomba");
    output = "alive";
  }
  setPosition("goomba", 320, getYPosition("goomba"));
  var a = 0;
  var b = setInterval(function(){
    setPosition("goomba", getXPosition("goomba")-2, getYPosition("goomba"));
    setImageURL("goomba", "goomba"+((a%2)+1)+".png");
    a++;
    if((getXPosition("goomba") + getProperty("goomba", "width")) <= 0){
      clearInterval(b);
    }
  }, 80);
  goomba_interval = setInterval(function(){
    collision("goomba");
  }, 10);
}

var d = 10;


// piranha plant function
var plant_interval;
function pipe_plant(){
  for (var x = 0; x < 2; x++){
    showElement(pipe[x]);
    if (elements.indexOf(pipe[x]) == -1){
      appendItem(elements, pipe[x]);
      output = "alive";
    }
  }
  setPosition("pipe", 320, getYPosition("pipe"));
  setPosition("plant", 343, getYPosition("plant"));
  
  plant_interval = setInterval(function(){
   collision("plant");
  }, 10);
  
  var a = 0;
  var e = setInterval(function(){
    setImageURL("plant", "plant"+((a%2)+4)+".png");
    setPosition("plant", getXPosition("plant"), getYPosition("plant")+d);
    if (getYPosition("plant") > 325 || getYPosition("plant") < 195){
      d = -d;
      log_message(getYPosition("plant"));
    }
    a++;
    if((getXPosition("pipe") + getProperty("pipe", "width")) <= 0){
      clearInterval(e);
    }
  }, 500);
}
// function to control the coins
function game_coin(){
  console.log("game_coin");
    showElement("game_coin");
    var coin_interval = setInterval(function(){
      var coin_x = getXPosition("game_coin");
      var coin_y = getYPosition("game_coin");
      mario_x = getXPosition("mario");
      mario_y = getYPosition("mario");
      if (coin_y < mario_y + 100 && coin_y + getProperty("game_coin", "height") > mario_y && coin_x < mario_x + getProperty("mario", "width") && coin_x + getProperty("game_coin", "width") > mario_x){
        console.log("got coin");
        coin++;
        playSound("assets/Super-Mario-Bros.---Coin-Sound-Effect.mp3");
        setText("coin_text", coin);
        hideElement("game_coin");
        clearInterval(coin_interval);
      }
    }, 10);
}

setInterval(function(){
  game_coin();
}, 10000);

// function for when mario dies
function dead(){
  if (output == "dead"){
    set_lives();
    set_score(-100);
    console.log("in dead");
    setImageURL("mario", "assets/mario_die.png");
    timedLoop(30, function(){
      setPosition("mario", getXPosition("mario"), getYPosition("mario") - 5);
      if (getYPosition("mario") < 235){
        stopTimedLoop();
      }
    });
    setTimeout(function(){
      timedLoop(30, function(){
        setPosition("mario", getXPosition("mario"), getYPosition("mario") + 5);
        if (getYPosition("mario") > 530){
          stopTimedLoop();
        }
      });
    }, 800);
    setTimeout(function(){
      setPosition("mario", 110, 280);
      setImageURL("mario", "assets/mario1.png");
    }, 4000);
    setTimeout(function(){
      output = "alive";
    },5000);
 }
}

// function to check whether mario is standing on a block
function is_any_block_below_mario(){
  for(var i = 0; i < blocks.length; i++){
    if(is_block_below_mario(i)){
      block_below_mario = i;
      log_message("Found block below mario:" + block_below_mario);
      return true;
    }
  }
  
  block_below_mario = -1;
  return false;
}

function is_block_below_mario(block_index){
    var block = blocks[block_index];
    block_x = getXPosition(block);
    block_y = getYPosition(block);
    block_width = getProperty(block, "width");
    mario_x = getXPosition("mario");
    mario_y = getYPosition("mario");
    mario_width = getProperty("mario", "width");
    if ((mario_x - 40 + mario_width > block_x) 
        && (mario_x + 40 < block_x + block_width) 
        && (mario_y + 100 == block_y)){
       return true;
    }
    
    return false;
}

function fall(){
  if(is_any_block_below_mario())
  {
    log_message("In fall(), returning without doing anything");
    jumping = false;

    return;
  }
  timedLoop(50, function(){
    if(is_any_block_below_mario()){
        log_message("In fall(), found block below mario:" + block_below_mario);
        jumping = false;
        
        stopTimedLoop();
    }else{
     setPosition("mario", getXPosition("mario"), getYPosition("mario") + 10);
    }
  });

}

// function to write the score on the screen
function set_score(points){
  score += points;
  log_message(score);
  var score_length = (String(Math.abs(score))).length;
  setText("score", "");
  for (var i = 0; i < 7-score_length; i++){
    setText("score", getText("score") + "0");
  }
  
  if (score < 0){
    setText("score", "-" + getText("score") + Math.abs(score));
  } else {
    setText("score", getText("score") + Math.abs(score));
  }
}

function lost_game(){
  setScreen("end_screen");
  output = "dead";
  total_score = score + (50*coin) + (100*lives) + (10*time);
  var counter = 0;
  timedLoop(2, function(){
    if (counter == total_score){
      stopTimedLoop();  
    }
    counter++;
    setText("total_score_end", counter);
  });
}

function set_lives(){
  lives --;
  setText("lives", lives);
  if (lives == 0){
    setTimeout(function(){
      lost_game();
    }, 3000);
  }
}

function show_castle(){
  if (is_end_game == false){
    showElement("castle");
    setPosition("castle", 320, getYPosition("castle"));
    appendItem(elements, "castle");
    is_end_game = true;
  }
}

function won_game(){
  setImageURL("mario", "assets/mario_win.png");
  playSound("Stage-Win-(Super-Mario)---Sound-Effect-HD.mp3");
  jump();
  setTimeout(function(){
    setScreen("won_screen");
    setText("score2", getText("score"));
    setText("coin_text2", getText("coin_text"));
    setText("lives2", getText("lives"));
    setText("time2", getText("time"));
    total_score = getNumber("score") + (50*getNumber("coin_text2") + (100*getNumber("lives2")) + (10*getNumber("time2")));
    var counter = 0;
    timedLoop(1, function(){
      if (counter == total_score){
        stopTimedLoop();  
      }
      counter++;
      setText("total_score", counter);

    });
  }, 4000);
}

function start_game(){
  setScreen("game_screen");
  score = 0;
  time = 180;
  setText("score", "0000000");
  setNumber("time", 180);
  lives = 3;
  setText("lives", 3);
  setText("coin_text", 0);
  coin = 0;
  setPosition("goomba", getXPosition("goomba"), 340);
  setPosition("pipe", 220, 295);
  setPosition("plant", 243, 185);
  setPosition("castle", -15, 120);
  walk_num = 1;
  hideElement("castle");
  elements = ["cloud", "baby_cloud", "bush", "hill", "ground1", "ground2", "ground3", "ground4", "goomba", "pipe", "plant", "platform", 'platform2', "game_coin"];
  key_states = [false, false, false, false]; //up, down, left, right
  jumping = false;
  dir = -1; // direction- right is -1 and left is 1:
  steps = 0;
  output = "alive";
  block_below_mario = 0;
  score = 0;
  time = 180;
  lives = 3;
  is_end_game = false; 
  total_score = 0;
  d = Math.abs(d);
}

timer (); 
function timer(){
  time = 180;
  setText("time", 180);
  setInterval(function(){
    if (time == 0){
      dead();
      setTimeout(function(){
        lost_game();
        stopTimedLoop();
      }, 500);
    }
    setText("time", time);
    time --;
  }, 1000);
}

function log_message(message){
  //console.log(message);
}

onEvent("start_screen", "keydown", function(key){
  if (key.key == "Up" || key.key == "Down"){
    hideElement("key_text");
    if(getYPosition("mushroom") == 205){
      setPosition("mushroom", getXPosition("mushroom"), 245);
    } 
    else{ 
      setPosition("mushroom", getXPosition("mushroom"), 205);
    }
  }
  else if (key.key == "Enter"){
    if (getYPosition("mushroom") == 205  && instructions_shown == false){
      showElement("instructions_text");
      instructions_shown = true;
    } 
    else if (instructions_shown == true){
      hideElement("instructions_text");
      instructions_shown = false;
    }
    else if (getYPosition("mushroom") == 245 && instructions_shown == false){
      start_game();
    }
  }
});
setInterval(function(){
  if(is_end_game == false){
    pipe_plant();
  }
}, 20000);


goomba();
setInterval(function(){
  if (is_end_game == false){
    goomba();
  }
}, 7000);
  is_game_started = true;

playSound("assets/Super-Mario-Bros.-Theme-Song.mp3", true);

onEvent("game_screen", "keydown", function(key){
  
  if (output != "dead"){
    if (key.key == "Right" || key.key == "d"){
      key_states[3] = true;
      setImageURL("mario", "mario"+walk_num+".png");
      dir = -1;
      if(is_any_block_below_mario())
      {
        walk(1);
      }
      else
      {
        fall();
      }
    }
    else if (key.key == "Left" || key.key == "a"){
      key_states[2] = true;
      setImageURL("mario", "mario"+walk_num+"_l.png");
      dir = 1;
      if(is_any_block_below_mario())
      {
        walk(1);
      }
      else
      {
        fall();
      }
    }
    else if (key.key == "Up" || key.key == " " || key.key == "w"){
      key_states[0] = true;
      jump();
    }
    else if (key.key == "Down" || key.key == "s"){
      key_states[1] = true;
    }
    
    walk_num++;
    if (walk_num > 11){
      walk_num = 1;
    }
  }
});

onEvent("game_screen", "keyup", function(key){
  if (output != "dead"){
    if (key.key == "Right" || key.key == "d"){
      key_states[3] = false;
    }
    else if (key.key == "Left" || key.key == "a"){
      key_states[2] = false;
    }
    else if (key.key == "Up" || key.key == "w" || key.key == " "){
      key_states[0] = false;
    }
    else if (key.key == "Down" || key.key == "s"){
      key_states[1] = false;
    }
  }
});

onEvent("restart", "click", function(){
  setScreen("start_screen");
});

onEvent("play_again", "click", function(){
  setScreen("start_screen");
});

onEvent("leaderboard_submit", "click", function(){
  createRecord("leaderboard", {name: getText("name_input"), score: total_score}, function(){
  });
  setTimeout(function(){
    setScreen("leaderboard_screen");
    setText("leaderboard_area", "");
    find_leaders();
  }, 5);
});


  
function find_leaders(){
  
  var leader_scores_new = [];
  var leaders = [];
  var leader_scores_old = [];
  
  readRecords("leaderboard",{},function(records) {
    for (var i = 0; i < records.length; i++) {
      leader_scores_new.push(records[i].score);
      leader_scores_old.push(records[i].score);
      leaders.push(records[i].name);
    }
    leader_scores_new.sort(function(a, b){return b-a});
    for (var x = 0; x < 10; x++){
      var index = leader_scores_old.indexOf(leader_scores_new[x]);
      console.log(index);
      setText("leaderboard_area", getText("leaderboard_area") + "\n" + leaders[index] + " : " + leader_scores_new[x]);
      console.log("leaderboard");
    }
  });
}



